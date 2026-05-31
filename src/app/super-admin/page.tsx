"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

import {
  Building2,
  Wallet,
  AlertTriangle,
  Activity,
  TrendingUp,
  Loader2,
  ArrowRight,
  BellRing,
  Clock,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SuperAdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [cargando, setCargando] = useState(true);
  const [metricas, setMetricas] = useState({
    clinicasActivas: 0,
    clinicasSuspendidas: 0,
    pagosPendientes: 0,
    ingresosMesEstimados: 0,
  });

  // Nuevo estado para el Feed de Actividad
  const [ultimosPagos, setUltimosPagos] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && user?.rol !== "SUPER_ADMIN") {
      router.push("/dashboard");
      return;
    }

    const cargarMétricasGlobales = async () => {
      try {
        const hoy = new Date();
        const mesActual = hoy.getMonth();
        const añoActual = hoy.getFullYear();

        // 1. Clínicas
        let activas = 0;
        let suspendidas = 0;
        const qUsuarios = query(
          collection(db, "usuarios"),
          where("rol", "==", "TENANT_ADMIN"),
        );
        const snapUsuarios = await getDocs(qUsuarios);

        snapUsuarios.forEach((doc) => {
          if (doc.data().estado === "Suspendido") suspendidas++;
          else activas++;
        });

        // 2. Pagos y Actividad
        let ingresosEsteMes = 0;
        const pagosArray: any[] = [];
        const snapPagos = await getDocs(collection(db, "pagos_pendientes"));

        snapPagos.forEach((doc) => {
          const data = doc.data();
          pagosArray.push({ id: doc.id, ...data });

          if (data.estado === "Aprobado" && data.fechaAprobacion) {
            const fechaAprobacion = new Date(data.fechaAprobacion);
            if (
              fechaAprobacion.getMonth() === mesActual &&
              fechaAprobacion.getFullYear() === añoActual
            ) {
              ingresosEsteMes += Number(data.monto || 0);
            }
          }
        });

        // Filtrar y ordenar los pendientes para el "Centro de Acción"
        const pendientes = pagosArray.filter(
          (p) => p.estado === "Pendiente de Aprobación",
        );
        pendientes.sort(
          (a, b) =>
            new Date(b.fechaSolicitud).getTime() -
            new Date(a.fechaSolicitud).getTime(),
        );

        setMetricas({
          clinicasActivas: activas,
          clinicasSuspendidas: suspendidas,
          pagosPendientes: pendientes.length,
          ingresosMesEstimados: ingresosEsteMes,
        });

        // Guardamos solo los 4 más recientes para no saturar la vista
        setUltimosPagos(pendientes.slice(0, 4));
      } catch (error) {
        console.error("Error cargando métricas del SaaS:", error);
      } finally {
        setCargando(false);
      }
    };

    if (!authLoading && user) cargarMétricasGlobales();
  }, [user, authLoading, router]);

  // Saludo dinámico según la hora
  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  if (authLoading || cargando) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-slate-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="font-medium text-emerald-800">
          Sincronizando con la red de clínicas...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      {/* HEADER TIPO CONSOLA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Acceso Global
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {obtenerSaludo()}, {user?.nombre?.split(" ")[0] || "Administrador"}
          </h1>
          <p className="text-slate-500 mt-1">
            Este es el rendimiento de DentaSync en tiempo real.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Ingresos del Mes
          </p>
          <p className="text-3xl font-black text-emerald-600">
            Bs. {metricas.ingresosMesEstimados.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* COLUMNA IZQUIERDA: KPIS (Ocupa 8 columnas) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-sky-300 transition-colors group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-sky-50 rounded-xl text-sky-600 group-hover:bg-sky-100 group-hover:scale-110 transition-all">
                  <Building2 className="w-6 h-6" />
                </div>
                <TrendingUp className="w-5 h-5 text-sky-400 opacity-50" />
              </div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                Clínicas Activas
              </p>
              <h3 className="text-4xl font-black text-slate-800 mt-1">
                {metricas.clinicasActivas}
              </h3>
              <Button
                variant="link"
                onClick={() => router.push("/super-admin/clinicas")}
                className="p-0 h-auto mt-4 text-sky-600 text-sm font-semibold"
              >
                Gestionar red &rarr;
              </Button>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-red-300 transition-colors group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-50 rounded-xl text-red-600 group-hover:bg-red-100 group-hover:scale-110 transition-all">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                Cuentas Suspendidas
              </p>
              <h3 className="text-4xl font-black text-red-600 mt-1">
                {metricas.clinicasSuspendidas}
              </h3>
              <p className="text-xs text-slate-400 mt-4 font-medium">
                Bloqueos automáticos activos
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Activity className="w-48 h-48" />
            </div>
            <div className="relative z-10 md:w-2/3">
              <h3 className="text-xl font-bold mb-2">Estado del Sistema</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                El enrutador y la base de datos están funcionando correctamente.
                Las reglas de bloqueo por falta de pago están activas
                protegiendo tus ingresos.
              </p>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="bg-transparent border-slate-600 text-white hover:bg-slate-700"
                >
                  Ver Logs
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: CENTRO DE ACCIÓN (Ocupa 4 columnas) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <BellRing
                  className={`w-5 h-5 ${metricas.pagosPendientes > 0 ? "text-amber-500 animate-pulse" : "text-slate-400"}`}
                />
                Pagos por Validar
              </h2>
              {metricas.pagosPendientes > 0 && (
                <span className="bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  {metricas.pagosPendientes}
                </span>
              )}
            </div>

            <div className="flex-1 p-6 flex flex-col gap-4 bg-white">
              {ultimosPagos.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-10 h-full opacity-60">
                  <ShieldCheck className="w-12 h-12 text-emerald-500 mb-3" />
                  <p className="text-sm font-bold text-slate-700">
                    Todo al día
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    No hay comprobantes pendientes de revisión.
                  </p>
                </div>
              ) : (
                ultimosPagos.map((pago) => (
                  <div
                    key={pago.id}
                    className="p-4 rounded-xl border border-amber-100 bg-amber-50/30 hover:bg-amber-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-sm text-slate-800 truncate pr-2">
                        {pago.nombreClinica}
                      </p>
                      <p className="text-xs font-bold text-emerald-600 shrink-0">
                        Bs. {pago.monto}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-3 font-mono">
                      <Clock className="w-3 h-3" />{" "}
                      {new Date(pago.fechaSolicitud).toLocaleDateString()}
                    </div>
                    <Button
                      size="sm"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-xs h-8"
                      onClick={() => router.push("/super-admin/pagos")}
                    >
                      <CreditCard className="w-3 h-3 mr-2" /> Revisar y Aprobar
                    </Button>
                  </div>
                ))
              )}
            </div>

            {metricas.pagosPendientes > 4 && (
              <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                <Button
                  variant="link"
                  onClick={() => router.push("/super-admin/pagos")}
                  className="text-xs text-slate-500"
                >
                  Ver {metricas.pagosPendientes - 4} más...
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
