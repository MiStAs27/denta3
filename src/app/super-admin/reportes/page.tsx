"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  CreditCard, 
  Download,
  CalendarDays,
  Loader2,
  Building2,
  PieChart
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SuperAdminReportes() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [cargando, setCargando] = useState(true);
  const [datosReporte, setDatosReporte] = useState({
    ingresosHistoricos: 0,
    ingresosMes: 0,
    totalClinicas: 0,
    clinicasActivas: 0,
    clinicasSuspendidas: 0,
    distribucionPlanes: { mensual: 0, trimestral: 0, semestral: 0, anual: 0, prueba: 0 }
  });

  useEffect(() => {
    if (!authLoading && user?.rol !== "SUPER_ADMIN") {
      router.push("/dashboard");
      return;
    }

    const generarReporte = async () => {
      try {
        const hoy = new Date();
        const mesActual = hoy.getMonth();
        const añoActual = hoy.getFullYear();

        // 1. Analizar Clínicas y Planes
        let total = 0, activas = 0, suspendidas = 0;
        const planes = { mensual: 0, trimestral: 0, semestral: 0, anual: 0, prueba: 0 };
        
        const qUsuarios = query(collection(db, "usuarios"), where("rol", "==", "TENANT_ADMIN"));
        const snapUsuarios = await getDocs(qUsuarios);
        
        snapUsuarios.forEach((doc) => {
          total++;
          const data = doc.data();
          if (data.estado === "Suspendido") {
            suspendidas++;
          } else {
            activas++;
            // Lógica simple de conteo de planes (Asumiendo que guardas el 'planActual' en su perfil)
            const plan = data.planActual?.toLowerCase() || "prueba";
            if (plan.includes("mensual")) planes.mensual++;
            else if (plan.includes("trimestral")) planes.trimestral++;
            else if (plan.includes("semestral")) planes.semestral++;
            else if (plan.includes("anual")) planes.anual++;
            else planes.prueba++;
          }
        });

        // 2. Analizar Ingresos
        let historico = 0, mes = 0;
        const snapPagos = await getDocs(query(collection(db, "pagos_pendientes"), where("estado", "==", "Aprobado")));
        
        snapPagos.forEach((doc) => {
          const data = doc.data();
          const monto = Number(data.monto || 0);
          historico += monto;
          
          if (data.fechaAprobacion) {
            const fechaAprobacion = new Date(data.fechaAprobacion);
            if (fechaAprobacion.getMonth() === mesActual && fechaAprobacion.getFullYear() === añoActual) {
              mes += monto;
            }
          }
        });

        setDatosReporte({
          ingresosHistoricos: historico,
          ingresosMes: mes,
          totalClinicas: total,
          clinicasActivas: activas,
          clinicasSuspendidas: suspendidas,
          distribucionPlanes: planes
        });

      } catch (error) {
        console.error("Error generando reportes:", error);
      } finally {
        setCargando(false);
      }
    };

    if (!authLoading && user) generarReporte();
  }, [user, authLoading, router]);

  // Función para exportar un CSV básico
  const exportarDatosCSV = () => {
    const encabezados = "Métrica,Valor\n";
    const filas = [
      `Ingresos Totales (Bs),${datosReporte.ingresosHistoricos}`,
      `Ingresos del Mes (Bs),${datosReporte.ingresosMes}`,
      `Total de Clínicas,${datosReporte.totalClinicas}`,
      `Clínicas Activas,${datosReporte.clinicasActivas}`,
      `Clínicas Suspendidas,${datosReporte.clinicasSuspendidas}`,
      `Planes Mensuales,${datosReporte.distribucionPlanes.mensual}`,
      `Planes Anuales,${datosReporte.distribucionPlanes.anual}`
    ].join("\n");

    const blob = new Blob([encabezados + filas], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Reporte_DentaSync_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (authLoading || cargando) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-slate-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="font-medium text-emerald-800">Procesando cubos de datos y métricas...</p>
      </div>
    );
  }

  // Cálculos para las barras visuales
  const porcentajeActivas = datosReporte.totalClinicas > 0 
    ? Math.round((datosReporte.clinicasActivas / datosReporte.totalClinicas) * 100) 
    : 0;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-emerald-600" /> Informes y Analítica
          </h1>
          <p className="text-slate-500 mt-2">Visión profunda del rendimiento comercial de la plataforma.</p>
        </div>
        <Button 
          onClick={exportarDatosCSV}
          className="bg-slate-900 hover:bg-slate-800 text-white shadow-md"
        >
          <Download className="w-4 h-4 mr-2" /> Exportar a Excel (CSV)
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA 1: RESUMEN FINANCIERO */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 rounded-3xl shadow-lg text-white">
            <div className="flex items-center gap-2 mb-4 opacity-80">
              <TrendingUp className="w-5 h-5" />
              <h2 className="text-sm font-bold uppercase tracking-widest">Ingresos Históricos</h2>
            </div>
            <h3 className="text-4xl font-black mb-1">Bs. {datosReporte.ingresosHistoricos.toLocaleString()}</h3>
            <p className="text-sm text-emerald-200 font-medium">Facturación total desde el lanzamiento</p>
            
            <div className="mt-6 pt-6 border-t border-emerald-500/30 flex justify-between items-center">
              <div>
                <p className="text-xs uppercase tracking-wider text-emerald-200 mb-1">Este Mes</p>
                <p className="text-2xl font-bold">Bs. {datosReporte.ingresosMes.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <CalendarDays className="w-6 h-6 text-emerald-100" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="w-5 h-5 text-indigo-500" />
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Tasa de Retención</h2>
            </div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-3xl font-black text-slate-800">{porcentajeActivas}%</span>
              <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Saludable</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">Porcentaje de clínicas que pagan a tiempo.</p>
            
            <div className="w-full bg-red-100 rounded-full h-3 overflow-hidden flex">
              <div className="bg-emerald-500 h-full" style={{ width: `${porcentajeActivas}%` }}></div>
            </div>
            <div className="flex justify-between text-xs mt-2 font-medium">
              <span className="text-emerald-600">{datosReporte.clinicasActivas} Activas</span>
              <span className="text-red-500">{datosReporte.clinicasSuspendidas} Morosas</span>
            </div>
          </div>
        </div>

        {/* COLUMNA 2: DISTRIBUCIÓN DE CLIENTES Y PLANES */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 h-full">
            <div className="flex items-center gap-2 mb-8 border-b pb-4">
              <Building2 className="w-6 h-6 text-[#2651A3]" />
              <h2 className="text-xl font-bold text-slate-800">Composición de la Cartera</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Total Cuentas</p>
                <p className="text-3xl font-black text-slate-800">{datosReporte.totalClinicas}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-center">
                <p className="text-xs text-blue-600 font-bold uppercase mb-1">En Prueba (Free)</p>
                <p className="text-3xl font-black text-blue-700">{datosReporte.distribucionPlanes.prueba}</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Suscritos</p>
                <p className="text-3xl font-black text-emerald-700">{datosReporte.totalClinicas - datosReporte.distribucionPlanes.prueba}</p>
              </div>
            </div>

            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-6">Distribución por Planes de Pago</h3>
            
            <div className="space-y-5">
              {/* Barra Mensual */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-bold text-slate-600 flex items-center gap-2"><CreditCard className="w-4 h-4 text-sky-500"/> Plan Mensual</span>
                  <span className="font-bold text-slate-800">{datosReporte.distribucionPlanes.mensual} clínicas</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div className="bg-sky-500 h-3 rounded-full" style={{ width: `${datosReporte.totalClinicas ? (datosReporte.distribucionPlanes.mensual / datosReporte.totalClinicas) * 100 : 0}%` }}></div>
                </div>
              </div>

              {/* Barra Semestral */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-bold text-slate-600 flex items-center gap-2"><CreditCard className="w-4 h-4 text-purple-500"/> Plan Semestral</span>
                  <span className="font-bold text-slate-800">{datosReporte.distribucionPlanes.semestral} clínicas</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div className="bg-purple-500 h-3 rounded-full" style={{ width: `${datosReporte.totalClinicas ? (datosReporte.distribucionPlanes.semestral / datosReporte.totalClinicas) * 100 : 0}%` }}></div>
                </div>
              </div>

              {/* Barra Anual */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-bold text-slate-600 flex items-center gap-2"><CreditCard className="w-4 h-4 text-emerald-500"/> Plan Anual</span>
                  <span className="font-bold text-slate-800">{datosReporte.distribucionPlanes.anual} clínicas</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div className="bg-emerald-500 h-3 rounded-full" style={{ width: `${datosReporte.totalClinicas ? (datosReporte.distribucionPlanes.anual / datosReporte.totalClinicas) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}