"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

import { 
  Server, 
  Database, 
  HardDrive, 
  Activity, 
  CheckCircle2, 
  Zap,
  Globe2,
  Cpu,
  RefreshCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SuperAdminServidor() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [actualizando, setActualizando] = useState(false);

  useEffect(() => {
    if (!authLoading && user?.rol !== "SUPER_ADMIN") {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  // Simulador de actualización de métricas
  const refrescarMetricas = () => {
    setActualizando(true);
    setTimeout(() => setActualizando(false), 1500);
  };

  // Valores simulados para la UI (Representan los límites del plan gratuito de Firebase/Spark)
  const metricas = {
    lecturasDiarias: { actual: 12500, limite: 50000, porcentaje: 25 }, // Firestore Reads
    escriturasDiarias: { actual: 4200, limite: 20000, porcentaje: 21 }, // Firestore Writes
    almacenamiento: { actual: 1.2, limite: 5, porcentaje: 24, unidad: "GB" }, // Storage (Radiografías/Fotos)
    anchoBanda: { actual: 3.4, limite: 10, porcentaje: 34, unidad: "GB/mes" }, // Network Egress
  };

  if (authLoading) return null;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
              <Server className="w-3 h-3" /> Infraestructura Cloud
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-600 tracking-widest">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              En Línea
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Monitor de Estado y Límites</h1>
          <p className="text-slate-500 mt-1">Supervisa las cuotas de consumo de Firebase y la salud general de DentaSync.</p>
        </div>
        <Button 
          variant="outline" 
          className="border-slate-300 text-slate-700 bg-white"
          onClick={refrescarMetricas}
          disabled={actualizando}
        >
          <RefreshCcw className={`w-4 h-4 mr-2 ${actualizando ? 'animate-spin' : ''}`} /> 
          {actualizando ? "Sincronizando..." : "Actualizar Métricas"}
        </Button>
      </div>

      {/* ESTADO GENERAL DE SERVICIOS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { nombre: "Autenticación", icono: Zap, estado: "Operativo", color: "text-emerald-500" },
          { nombre: "Base de Datos (Firestore)", icono: Database, estado: "Operativo", color: "text-emerald-500" },
          { nombre: "Almacenamiento (Storage)", icono: HardDrive, estado: "Operativo", color: "text-emerald-500" },
          { nombre: "Hosting (Next.js)", icono: Globe2, estado: "Operativo", color: "text-emerald-500" },
        ].map((servicio, index) => (
          <div key={index} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
            <div className={`p-2 bg-slate-800 rounded-lg ${servicio.color}`}>
              <servicio.icono className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-300">{servicio.nombre}</p>
              <p className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3" /> {servicio.estado}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* MÉTRICAS DE CONSUMO (CUOTAS) */}
      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 pt-4">
        <Cpu className="w-5 h-5 text-indigo-500" /> Consumo de Cuotas (Plan Actual)
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LECTURAS Y ESCRITURAS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <Database className="w-4 h-4 text-sky-500" /> Operaciones de Base de Datos
          </h3>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-slate-600">Lecturas Diarias (Reads)</span>
              <span className="font-bold text-slate-800">{metricas.lecturasDiarias.actual.toLocaleString()} / {metricas.lecturasDiarias.limite.toLocaleString()}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5">
              <div className="bg-sky-500 h-2.5 rounded-full" style={{ width: `${metricas.lecturasDiarias.porcentaje}%` }}></div>
            </div>
            <p className="text-[10px] text-slate-400 text-right">{metricas.lecturasDiarias.porcentaje}% consumido hoy</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-slate-600">Escrituras Diarias (Writes)</span>
              <span className="font-bold text-slate-800">{metricas.escriturasDiarias.actual.toLocaleString()} / {metricas.escriturasDiarias.limite.toLocaleString()}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5">
              <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${metricas.escriturasDiarias.porcentaje}%` }}></div>
            </div>
            <p className="text-[10px] text-slate-400 text-right">{metricas.escriturasDiarias.porcentaje}% consumido hoy</p>
          </div>
        </div>

        {/* ALMACENAMIENTO Y RED */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-purple-500" /> Almacenamiento y Red
          </h3>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-slate-600">Espacio de Storage (Fotos/Archivos)</span>
              <span className="font-bold text-slate-800">{metricas.almacenamiento.actual} {metricas.almacenamiento.unidad} / {metricas.almacenamiento.limite} {metricas.almacenamiento.unidad}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5">
              <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${metricas.almacenamiento.porcentaje}%` }}></div>
            </div>
            <p className="text-[10px] text-slate-400 text-right">{metricas.almacenamiento.porcentaje}% consumido del mes</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-slate-600">Ancho de Banda (Descargas)</span>
              <span className="font-bold text-slate-800">{metricas.anchoBanda.actual} {metricas.anchoBanda.unidad} / {metricas.anchoBanda.limite} {metricas.anchoBanda.unidad}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5">
              <div className="bg-teal-500 h-2.5 rounded-full" style={{ width: `${metricas.anchoBanda.porcentaje}%` }}></div>
            </div>
            <p className="text-[10px] text-slate-400 text-right">{metricas.anchoBanda.porcentaje}% consumido del mes</p>
          </div>
        </div>

      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start gap-3 mt-4">
        <Activity className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-blue-800">Nota sobre las métricas en tiempo real</p>
          <p className="text-xs text-blue-700 mt-1">
            Los valores mostrados actualmente son representaciones visuales. Para obtener las métricas de consumo en tiempo real de Firebase y Google Cloud Platform, será necesario configurar la API de facturación de GCP en el backend en una etapa posterior del proyecto.
          </p>
        </div>
      </div>

    </div>
  );
}