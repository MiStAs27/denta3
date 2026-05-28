"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  ShieldAlert,
  Building2,
  Users,
  CreditCard,
  Settings,
  Power,
  Search,
  MoreVertical,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function SuperAdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [cargando, setCargando] = useState(true);
  const [metricas, setMetricas] = useState({
    totalClinicas: 0,
    totalUsuarios: 0,
    ingresosSaaS: 0,
  });

  const [clinicas, setClinicas] = useState<any[]>([]);

  // --- ESTADOS PARA NUEVA CLÍNICA ---
  const [mostrandoModal, setMostrandoModal] = useState(false);
  const [guardandoClinica, setGuardandoClinica] = useState(false);
  const [nuevaClinicaForm, setNuevaClinicaForm] = useState({
    nombreAdmin: "",
    email: "",
    nombreClinica: "",
    password: "", // Nota: En producción, la contraseña se maneja con Firebase Admin
  });

  const cargarDatosSaaS = async () => {
    if (!user) return;

    try {
      const usuariosSnap = await getDocs(collection(db, "usuarios"));
      const totalUsers = usuariosSnap.size;

      const clinicasQuery = query(
        collection(db, "usuarios"),
        where("rol", "==", "TENANT_ADMIN"),
      );
      const clinicasSnap = await getDocs(clinicasQuery);

      const listaClinicas: any[] = [];
      clinicasSnap.forEach((doc) => {
        const data = doc.data();
        listaClinicas.push({
          id: doc.id,
          nombreAdmin: data.nombre || data.displayName || "Sin nombre",
          email: data.email,
          clinica: data.nombreClinica || "Clínica Principal",
          estado: data.estado || "Activo",
          fechaRegistro: data.fechaCreacion || new Date().toISOString(),
        });
      });

      setMetricas({
        totalClinicas: listaClinicas.length,
        totalUsuarios: totalUsers,
        ingresosSaaS: listaClinicas.length * 50, // 50 USD por suscripción
      });

      setClinicas(listaClinicas);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.rol !== "SUPER_ADMIN") {
      router.push("/dashboard");
      return;
    }
    cargarDatosSaaS();
  }, [user, authLoading, router]);

  // --- FUNCIÓN PARA CREAR NUEVA CLÍNICA ---
  const crearNuevaClinica = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaClinicaForm.email || !nuevaClinicaForm.nombreAdmin) return;
    setGuardandoClinica(true);

    try {
      // 1. Guardamos el perfil del nuevo Administrador de Clínica en Firestore
      await addDoc(collection(db, "usuarios"), {
        email: nuevaClinicaForm.email.toLowerCase(),
        nombre: nuevaClinicaForm.nombreAdmin,
        nombreClinica: nuevaClinicaForm.nombreClinica,
        rol: "TENANT_ADMIN",
        estado: "Activo",
        fechaCreacion: new Date().toISOString(),
      });

      toast({
        title: "¡Clínica creada con éxito!",
        description: `El administrador ${nuevaClinicaForm.nombreAdmin} ya tiene acceso.`,
      });

      // Limpiamos el formulario y cerramos modal
      setNuevaClinicaForm({
        nombreAdmin: "",
        email: "",
        nombreClinica: "",
        password: "",
      });
      setMostrandoModal(false);

      // Recargamos la tabla para ver al nuevo cliente
      cargarDatosSaaS();
    } catch (error) {
      console.error("Error al crear clínica:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la clínica.",
        variant: "destructive",
      });
    } finally {
      setGuardandoClinica(false);
    }
  };

  if (authLoading || cargando) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="font-bold">Iniciando Consola de Super Administrador...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in relative">
        {/* CABECERA SUPER ADMIN */}
        <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400">
              <ShieldAlert size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Consola SaaS Maestro</h1>
              <p className="text-slate-400 text-sm mt-1">
                Gestión global de la plataforma DentaSync
              </p>
            </div>
          </div>
        </div>

        {/* MÉTRICAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
              <Building2 size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">
                Clínicas Activas
              </p>
              <h3 className="text-2xl font-bold text-slate-800">
                {metricas.totalClinicas}
              </h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">
                Usuarios Globales
              </p>
              <h3 className="text-2xl font-bold text-slate-800">
                {metricas.totalUsuarios}
              </h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">
                Ingresos (MRR)
              </p>
              <h3 className="text-2xl font-bold text-slate-800">
                ${metricas.ingresosSaaS.toFixed(2)}
              </h3>
            </div>
          </div>
        </div>

        {/* DIRECTORIO DE CLÍNICAS */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-lg font-bold text-slate-800">
              Directorio de Clínicas
            </h2>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={() => setMostrandoModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
              >
                + Nueva Clínica
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-xs">
                <tr>
                  <th className="px-6 py-4">Clínica / Administrador</th>
                  <th className="px-6 py-4">Fecha de Alta</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clinicas.map((clinica) => (
                  <tr key={clinica.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">
                        {clinica.clinica}
                      </p>
                      <p className="text-slate-500 text-xs">
                        Admin: {clinica.nombreAdmin} ({clinica.email})
                      </p>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-500">
                      {new Date(clinica.fechaRegistro).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded text-xs font-bold uppercase bg-emerald-100 text-emerald-700">
                        {clinica.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        title="Suspender"
                      >
                        <Power className="w-4 h-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- MODAL CREAR NUEVA CLÍNICA --- */}
        {mostrandoModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-xl font-bold text-slate-800">
                  Alta de Nueva Clínica
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMostrandoModal(false)}
                >
                  <X className="w-5 h-5 text-slate-500" />
                </Button>
              </div>

              <form onSubmit={crearNuevaClinica} className="p-6 space-y-4">
                <div>
                  <Label className="font-bold text-slate-700">
                    Nombre de la Clínica
                  </Label>
                  <Input
                    placeholder="Ej. OdontoCenter"
                    value={nuevaClinicaForm.nombreClinica}
                    onChange={(e: any) =>
                      setNuevaClinicaForm({
                        ...nuevaClinicaForm,
                        nombreClinica: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label className="font-bold text-slate-700">
                    Nombre del Dr. / Administrador
                  </Label>
                  <Input
                    placeholder="Ej. Dr. Carlos Ruiz"
                    value={nuevaClinicaForm.nombreAdmin}
                    onChange={(e: any) =>
                      setNuevaClinicaForm({
                        ...nuevaClinicaForm,
                        nombreAdmin: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label className="font-bold text-slate-700">
                    Correo Electrónico (Para Login)
                  </Label>
                  <Input
                    type="email"
                    placeholder="dr.carlos@email.com"
                    value={nuevaClinicaForm.email}
                    onChange={(e: any) =>
                      setNuevaClinicaForm({
                        ...nuevaClinicaForm,
                        email: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label className="font-bold text-slate-700">
                    Contraseña Inicial
                  </Label>
                  <Input
                    type="password"
                    placeholder="Min. 6 caracteres"
                    value={nuevaClinicaForm.password}
                    onChange={(e: any) =>
                      setNuevaClinicaForm({
                        ...nuevaClinicaForm,
                        password: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="pt-4 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setMostrandoModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700"
                    disabled={guardandoClinica}
                  >
                    {guardandoClinica ? "Creando..." : "Crear Clínica"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}