"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Activity, Users, DollarSign, Search, Power, PowerOff, ExternalLink } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Interfaz para el modelo de negocio (Tenant)
interface ClinicaSaaS {
  id: string;
  nombre: string;
  titular: string;
  emailContacto: string;
  plan: "GRATUITO" | "PRO" | "PREMIUM";
  estado: "ACTIVA" | "SUSPENDIDA";
  fechaRegistro: string;
  pacientesActuales: number;
}

export default function SuperAdminDashboard() {
  const [clinicas, setClinicas] = useState<ClinicaSaaS[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  const cargarClinicas = async () => {
    setCargando(true);
    try {
      // En el futuro leerá de tu colección real "clinicas"
      // const querySnapshot = await getDocs(collection(db, "clinicas"));
      
      // Por ahora simularemos datos para que veas el poder del panel SaaS
      const clinicasSimuladas: ClinicaSaaS[] = [
        { id: "tenant_1", nombre: "DentaSync La Paz", titular: "Dr. Carlos Ruiz", emailContacto: "cruiz@dentasync.com", plan: "PRO", estado: "ACTIVA", fechaRegistro: "2026-01-15", pacientesActuales: 850 },
        { id: "tenant_2", nombre: "Sonrisas Blancas", titular: "Dra. Ana López", emailContacto: "ana@sonrisas.com", plan: "GRATUITO", estado: "ACTIVA", fechaRegistro: "2026-03-20", pacientesActuales: 120 },
        { id: "tenant_3", nombre: "Odontología Express", titular: "Dr. Mario Vargas", emailContacto: "admin@odoexpress.com", plan: "PREMIUM", estado: "SUSPENDIDA", fechaRegistro: "2025-11-05", pacientesActuales: 3400 },
      ];
      
      setClinicas(clinicasSimuladas);
    } catch (error) {
      console.error("Error al cargar clínicas:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarClinicas();
  }, []);

  const alternarEstadoClinica = async (id: string, estadoActual: string) => {
    const nuevoEstado = estadoActual === "ACTIVA" ? "SUSPENDIDA" : "ACTIVA";
    const accion = nuevoEstado === "SUSPENDIDA" ? "suspender" : "reactivar";
    
    if (window.confirm(`¿Estás seguro que deseas ${accion} esta clínica?`)) {
      // Aquí iría el código real para actualizar Firebase:
      // await updateDoc(doc(db, "clinicas", id), { estado: nuevoEstado });
      
      // Actualizamos el estado local para ver el cambio visual
      setClinicas(clinicas.map(c => c.id === id ? { ...c, estado: nuevoEstado } : c));
      alert(`Clínica ${nuevoEstado.toLowerCase()} exitosamente.`);
    }
  };

  const clinicasFiltradas = clinicas.filter(c => 
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    c.titular.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0F172A] p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER SUPER ADMIN (Modo Oscuro para diferenciarlo del resto del sistema) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Activity className="text-emerald-400 w-8 h-8" />
              SaaS Central Control
            </h1>
            <p className="text-slate-400 mt-1">Gestión global de inquilinos (Tenants) y suscripciones.</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-semibold text-slate-300">Sistema Operativo</span>
            </div>
          </div>
        </div>

        {/* MÉTRICAS GLOBALES (KPIs) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-400">Total Clínicas</span>
              <Building2 className="text-blue-400 w-5 h-5" />
            </div>
            <span className="text-3xl font-bold text-white">{clinicas.length}</span>
          </div>
          
          <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-400">Pacientes Globales</span>
              <Users className="text-purple-400 w-5 h-5" />
            </div>
            <span className="text-3xl font-bold text-white">
              {clinicas.reduce((acc, curr) => acc + curr.pacientesActuales, 0).toLocaleString()}
            </span>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-400">MRR (Ingreso Mensual)</span>
              <DollarSign className="text-emerald-400 w-5 h-5" />
            </div>
            <span className="text-3xl font-bold text-white">$450.00</span>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-400">Tasa de Suspensión</span>
              <PowerOff className="text-red-400 w-5 h-5" />
            </div>
            <span className="text-3xl font-bold text-white">
              {Math.round((clinicas.filter(c => c.estado === 'SUSPENDIDA').length / clinicas.length) * 100)}%
            </span>
          </div>
        </div>

        {/* TABLA DE CLÍNICAS (TENANTS) */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden flex flex-col min-h-[500px]">
          
          <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-800/80">
            <h2 className="text-lg font-bold text-white">Consultorios Registrados</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Buscar clínica..." 
                className="pl-9 bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500 focus-visible:ring-emerald-500"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="w-full min-w-[800px]">
              
              {/* Encabezados */}
              <div className="grid grid-cols-12 gap-4 p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700 bg-slate-900/50">
                <div className="col-span-3">Clínica / Tenant</div>
                <div className="col-span-3">Titular y Contacto</div>
                <div className="col-span-2 text-center">Plan</div>
                <div className="col-span-2 text-center">Estado</div>
                <div className="col-span-2 text-right">Acciones</div>
              </div>

              {/* Lista */}
              {clinicasFiltradas.map((clinica) => (
                <div key={clinica.id} className="grid grid-cols-12 gap-4 p-4 items-center border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                  
                  <div className="col-span-3">
                    <p className="font-bold text-slate-200">{clinica.nombre}</p>
                    <p className="text-xs text-slate-500 font-mono mt-1">ID: {clinica.id}</p>
                  </div>

                  <div className="col-span-3">
                    <p className="text-sm font-medium text-slate-300">{clinica.titular}</p>
                    <p className="text-xs text-slate-500">{clinica.emailContacto}</p>
                  </div>

                  <div className="col-span-2 flex justify-center">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border 
                      ${clinica.plan === 'PREMIUM' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                        clinica.plan === 'PRO' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'}
                    `}>
                      {clinica.plan} ({clinica.pacientesActuales} pac.)
                    </span>
                  </div>

                  <div className="col-span-2 flex justify-center">
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border 
                      ${clinica.estado === 'ACTIVA' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}
                    `}>
                      <span className={`w-1.5 h-1.5 rounded-full ${clinica.estado === 'ACTIVA' ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                      {clinica.estado}
                    </span>
                  </div>

                  <div className="col-span-2 flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-700" title="Ver detalles (Próximamente)">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={clinica.estado === 'ACTIVA' ? 'text-red-400 hover:text-red-300 hover:bg-red-400/10' : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10'} 
                      title={clinica.estado === 'ACTIVA' ? 'Suspender servicio' : 'Reactivar servicio'}
                      onClick={() => alternarEstadoClinica(clinica.id, clinica.estado)}
                    >
                      {clinica.estado === 'ACTIVA' ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                    </Button>
                  </div>

                </div>
              ))}

            </div>
          </ScrollArea>
        </div>

      </div>
    </div>
  );
}