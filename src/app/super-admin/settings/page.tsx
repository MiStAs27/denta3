"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

import { 
  Settings, 
  Save, 
  Clock, 
  Phone, 
  Mail, 
  Globe, 
  AlertTriangle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function SuperAdminSettings() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Estado central para la configuración global del SaaS
  const [config, setConfig] = useState({
    diasPruebaGratis: 14,
    emailSoporte: "soporte@dentasync.com",
    whatsappSoporte: "+59100000000",
    sitioWeb: "https://dentasync.com",
    mantenimientoActivo: false,
  });

  useEffect(() => {
    if (!authLoading && user?.rol !== "SUPER_ADMIN") {
      router.push("/dashboard");
      return;
    }

    const cargarConfiguracion = async () => {
      try {
        const docRef = doc(db, "configuracion", "saas_global");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setConfig({ ...config, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error cargando configuración global:", error);
      } finally {
        setCargando(false);
      }
    };

    if (!authLoading && user) cargarConfiguracion();
  }, [user, authLoading, router]);

  const guardarConfiguracion = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    try {
      // 🔒 Se guarda en un documento maestro que tu Landing Page y sistema leerán
      await setDoc(doc(db, "configuracion", "saas_global"), config, { merge: true });
      
      toast({ 
        title: "¡Configuración actualizada!", 
        description: "Los cambios globales ya están en línea." 
      });
    } catch (error) {
      console.error("Error guardando:", error);
      toast({ title: "Error al guardar", variant: "destructive" });
    } finally {
      setGuardando(false);
    }
  };

  if (authLoading || cargando) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-slate-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="font-medium">Cargando variables del sistema...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in">
      
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
          <Settings className="w-8 h-8 text-emerald-600" /> Ajustes Globales del Sistema
        </h1>
        <p className="text-slate-500 mt-2">
          Modifica las reglas de negocio y los datos de contacto que ven todas las clínicas.
        </p>
      </div>

      <form onSubmit={guardarConfiguracion} className="space-y-8">
        
        {/* SECCIÓN 1: Reglas de Negocio */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-sky-500" /> Reglas de Suscripción
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700">Días de Prueba Gratis (Free Trial)</Label>
              <Input 
                type="number" 
                min="0"
                value={config.diasPruebaGratis}
                onChange={(e) => setConfig({ ...config, diasPruebaGratis: Number(e.target.value) })}
                className="bg-slate-50 border-slate-200"
              />
              <p className="text-[10px] text-slate-500">
                Al registrarse una nueva clínica, el sistema les sumará automáticamente esta cantidad de días.
              </p>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: Contacto Oficial */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-500" /> Contacto Oficial (Soporte)
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Estos datos aparecerán en los correos de facturación y en el botón de "Ayuda" de los doctores.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-sm font-bold text-slate-700">
                <Mail className="w-4 h-4 text-slate-400" /> Email de Soporte
              </Label>
              <Input 
                type="email" 
                value={config.emailSoporte}
                onChange={(e) => setConfig({ ...config, emailSoporte: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-sm font-bold text-slate-700">
                <Phone className="w-4 h-4 text-emerald-500" /> WhatsApp Comercial
              </Label>
              <Input 
                type="text" 
                value={config.whatsappSoporte}
                onChange={(e) => setConfig({ ...config, whatsappSoporte: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: Zona de Peligro */}
        <div className="bg-red-50 p-6 rounded-2xl border border-red-200">
          <h2 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Controles de Emergencia
          </h2>
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-red-100">
            <div>
              <p className="font-bold text-slate-800">Modo Mantenimiento</p>
              <p className="text-xs text-slate-500 mt-1">
                Al activar esto, nadie podrá iniciar sesión excepto los Super Admins. Ideal para actualizaciones grandes.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={config.mantenimientoActivo}
                onChange={(e) => setConfig({ ...config, mantenimientoActivo: e.target.checked })}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg px-8 py-6 text-lg"
            disabled={guardando}
          >
            {guardando ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Guardando...</>
            ) : (
              <><Save className="w-5 h-5 mr-2" /> Guardar Configuración Global</>
            )}
          </Button>
        </div>

      </form>
    </div>
  );
}