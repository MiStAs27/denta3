"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

import { CreditCard, Save, Loader2, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function SuscripcionesSuperAdmin() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Estados para los 4 planes
  const [precios, setPrecios] = useState({
    mes1: "",
    mes3: "",
    mes6: "",
    mes12: ""
  });

  useEffect(() => {
    // 🔒 Seguridad: Solo el Super Admin puede entrar aquí
    if (!authLoading && user?.rol !== "SUPER_ADMIN") {
      router.push("/dashboard");
      return;
    }

    const cargarTarifas = async () => {
      try {
        // Buscamos el documento central de configuración
        const docRef = doc(db, "configuracion", "suscripciones");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setPrecios({
            mes1: data.mes1 || "",
            mes3: data.mes3 || "",
            mes6: data.mes6 || "",
            mes12: data.mes12 || ""
          });
        }
      } catch (error) {
        console.error("Error al cargar tarifas:", error);
      } finally {
        setCargando(false);
      }
    };

    if (!authLoading) cargarTarifas();
  }, [user, authLoading, router]);

  const guardarTarifas = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const docRef = doc(db, "configuracion", "suscripciones");
      // Guardamos o actualizamos los precios en la bóveda central
      await setDoc(docRef, {
        mes1: Number(precios.mes1),
        mes3: Number(precios.mes3),
        mes6: Number(precios.mes6),
        mes12: Number(precios.mes12),
        ultimaActualizacion: new Date().toISOString()
      }, { merge: true });

      toast({ title: "Tarifas actualizadas correctamente." });
    } catch (error) {
      console.error("Error al guardar tarifas:", error);
      toast({ title: "Error al guardar", variant: "destructive" });
    } finally {
      setGuardando(false);
    }
  };

  if (authLoading || cargando) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-[#2651A3] gap-3">
        <Loader2 className="w-10 h-10 animate-spin" />
        <p className="font-bold">Cargando configuración financiera...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in">
      
      {/* CABECERA */}
      <div>
        <h1 className="text-3xl font-bold text-[#2651A3] flex items-center gap-2">
          <CreditCard className="w-8 h-8 text-[#39ACB8]" />
          Suscripciones y Pagos
        </h1>
        <p className="text-gray-500 mt-1">
          Configura las tarifas globales de DentaSync. Cualquier cambio aquí se reflejará inmediatamente en la web y en los paneles de los doctores.
        </p>
      </div>

      {/* FORMULARIO DE TARIFAS */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b">
          <TrendingUp className="text-emerald-600 w-5 h-5" />
          <h2 className="text-xl font-bold text-slate-800">Planes de Suscripción</h2>
        </div>

        <form onSubmit={guardarTarifas} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* PLAN 1 MES */}
            <div className="space-y-2 p-4 bg-slate-50 rounded-lg border border-slate-100">
              <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#2651A3]" /> Plan Mensual (1 Mes)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 font-bold">Bs.</span>
                <Input 
                  type="number" 
                  className="pl-10 text-lg font-bold text-[#2651A3]" 
                  placeholder="Ej. 150"
                  value={precios.mes1}
                  onChange={(e) => setPrecios({...precios, mes1: e.target.value})}
                  required
                />
              </div>
              <p className="text-xs text-slate-500">Precio base sin descuento.</p>
            </div>

            {/* PLAN 3 MESES */}
            <div className="space-y-2 p-4 bg-slate-50 rounded-lg border border-slate-100">
              <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#39ACB8]" /> Plan Trimestral (3 Meses)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 font-bold">Bs.</span>
                <Input 
                  type="number" 
                  className="pl-10 text-lg font-bold text-[#39ACB8]" 
                  placeholder="Ej. 400"
                  value={precios.mes3}
                  onChange={(e) => setPrecios({...precios, mes3: e.target.value})}
                  required
                />
              </div>
              <p className="text-xs text-slate-500">Sugerencia: Aplica un pequeño descuento.</p>
            </div>

            {/* PLAN 6 MESES */}
            <div className="space-y-2 p-4 bg-purple-50 rounded-lg border border-purple-100">
              <Label className="text-sm font-bold text-purple-700 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Plan Semestral (6 Meses)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-purple-500 font-bold">Bs.</span>
                <Input 
                  type="number" 
                  className="pl-10 text-lg font-bold text-purple-700" 
                  placeholder="Ej. 750"
                  value={precios.mes6}
                  onChange={(e) => setPrecios({...precios, mes6: e.target.value})}
                  required
                />
              </div>
              <p className="text-xs text-purple-600">Ideal para retención a mediano plazo.</p>
            </div>

            {/* PLAN 1 AÑO */}
            <div className="space-y-2 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
              <Label className="text-sm font-bold text-emerald-700 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Plan Anual (12 Meses)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-emerald-500 font-bold">Bs.</span>
                <Input 
                  type="number" 
                  className="pl-10 text-lg font-bold text-emerald-700" 
                  placeholder="Ej. 1400"
                  value={precios.mes12}
                  onChange={(e) => setPrecios({...precios, mes12: e.target.value})}
                  required
                />
              </div>
              <p className="text-xs text-emerald-600">Ofrece el mayor descuento por el pago adelantado.</p>
            </div>

          </div>

          <div className="pt-6 border-t flex justify-end">
            <Button type="submit" className="bg-[#2651A3] hover:bg-[#1a3a75] px-8" disabled={guardando}>
              {guardando ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...</>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> Guardar Tarifas Oficiales</>
              )}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}   