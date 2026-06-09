"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Users, Calendar, CircleDollarSign, AlertCircle,
  Activity, ArrowRight, Loader2, PlusCircle, CreditCard, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [metricas, setMetricas] = useState({
    citasHoy: 0,
    pacientesNuevos: 0,
    totalPorCobrar: 0,
    ingresosMes: 0, // 🔒 Solo para el Admin
  });

  const [alertasCobro, setAlertasCobro] = useState<any[]>([]);
  const [agendaHoy, setAgendaHoy] = useState<any[]>([]);

  useEffect(() => {
    const cargarDatosReales = async () => {
      if (!user?.tenantId) return;

      try {
        const hoy = new Date();
        const mesActual = hoy.getMonth();
        const añoActual = hoy.getFullYear();
        const fechaHoyStr = hoy.toISOString().split("T")[0];

        // 1. ANALIZAR PACIENTES Y DEUDAS GLOBALES
        const pacientesQuery = query(
          collection(db, "pacientes"),
          where("tenantId", "==", user.tenantId)
        );
        const pacientesSnapshot = await getDocs(pacientesQuery);

        let totalDeudaCalculada = 0;
        let nuevosEsteMesCalculado = 0;
        let ingresosDelMes = 0;
        const listaDeudores: any[] = [];

        // Optimizamos usando Promise.all para cargar pagos rápido y calcular ingresos reales
        const promesasPagos = pacientesSnapshot.docs.map(doc => 
          getDocs(collection(db, "pacientes", doc.id, "pagos"))
        );
        const resultadosPagos = await Promise.all(promesasPagos);

        pacientesSnapshot.docs.forEach((doc, index) => {
          const data = doc.data();

          if (data.saldoPendiente && data.saldoPendiente > 0) {
            totalDeudaCalculada += data.saldoPendiente;
            listaDeudores.push({
              id: doc.id,
              nombre: data.nombre,
              deuda: data.saldoPendiente,
              celular: data.celular || "S/N",
            });
          }

          if (data.fechaCreacion) {
            const fechaDoc = new Date(data.fechaCreacion);
            if (fechaDoc.getMonth() === mesActual && fechaDoc.getFullYear() === añoActual) {
              nuevosEsteMesCalculado++;
            }
          }

          // Sumar ingresos reales del mes actual (Para el Admin)
          resultadosPagos[index].forEach((pagoDoc) => {
            const pagoData = pagoDoc.data();
            if (pagoData.estado === "Activo" && pagoData.montoNeto && pagoData.fecha) {
              const fechaAbono = new Date(pagoData.fecha);
              if (
                fechaAbono.getMonth() === mesActual &&
                fechaAbono.getFullYear() === añoActual
              ) {
                ingresosDelMes += pagoData.montoNeto;
              }
            }
          });
        });

        listaDeudores.sort((a, b) => b.deuda - a.deuda);

        // 2. TRAER CITAS DE HOY
        const citasDelDia: any[] = [];
        try {
          // 🔒 Si es un DOCTOR, solo ve sus citas. Si es Admin o Secretaria, ve todas.
          let citasQuery = query(
            collection(db, "citas"),
            where("tenantId", "==", user.tenantId),
            where("fecha", "==", fechaHoyStr)
          );

          // (Opcional si en tu BD guardas a qué doctor pertenece la cita)
          // if (user.rol === "ESPECIALISTA") {
          //   citasQuery = query(citasQuery, where("doctorId", "==", user.uid));
          // }

          const citasSnapshot = await getDocs(citasQuery);
          citasSnapshot.forEach((doc) =>
            citasDelDia.push({ id: doc.id, ...doc.data() })
          );
          
          // Ordenar por hora (asumiendo formato "09:00", "14:30")
          citasDelDia.sort((a, b) => a.hora.localeCompare(b.hora));
        } catch (error) {
          console.log("Nota: Aún no hay citas registradas hoy.");
        }

        setMetricas({
          citasHoy: citasDelDia.length,
          pacientesNuevos: nuevosEsteMesCalculado,
          totalPorCobrar: totalDeudaCalculada,
          ingresosMes: ingresosDelMes,
        });
        setAlertasCobro(listaDeudores.slice(0, 5));
        setAgendaHoy(citasDelDia);
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setCargandoDatos(false);
      }
    };

    if (!authLoading) cargarDatosReales();
  }, [user, authLoading]);

  if (authLoading || cargandoDatos) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-slate-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#2651A3]" />
        <p className="font-medium">Calculando métricas del consultorio...</p>
      </div>
    );
  }

  const esAdmin = user?.rol === "TENANT_ADMIN"
  const esSecretaria = user?.rol === "SECRETARIA" 
  const esDoctor = user?.rol === "ESPECIALISTA"

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in">
      
      {/* BIENVENIDA */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {esDoctor ? "Dr(a). " : "Hola, "}{user?.nombre || user?.email?.split("@")[0]}
          </h1>
          <p className="text-slate-500 flex items-center gap-2 mt-1">
            <span className="bg-[#2651A3] text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
              {user?.rol === 'TENANT_ADMIN' ? 'DIRECTOR MÉDICO' : user?.rol?.replace("_", " ")}
            </span>
            {esSecretaria ? "Panel Operativo" : esAdmin ? "Panel Gerencial" : "Panel Clínico"}
          </p>
        </div>
        
        {/* BOTONES RÁPIDOS (Más útiles para la Secretaria) */}
        <div className="flex gap-2">
          {(esAdmin || esSecretaria) && (
            <Button onClick={() => router.push("/agenda")} variant="outline" className="border-sky-200 text-sky-700 hover:bg-sky-50">
              <PlusCircle className="w-4 h-4 mr-2" /> Agendar Cita
            </Button>
          )}
          <Button onClick={() => router.push("/pacientes")} className="bg-[#39ACB8] hover:bg-[#2c8892]">
            <Users className="w-4 h-4 mr-2" /> Directorio
          </Button>
        </div>
      </div>

      {/* TARJETAS DE MÉTRICAS CONDICIONALES */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${esAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
        
        {/* Siempre visible para todos */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-[#2651A3]">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Citas Hoy</p>
            <h3 className="text-2xl font-bold text-slate-800">{metricas.citasHoy}</h3>
          </div>
        </div>

        {/* Solo Admin y Doctores ven crecimiento */}
        {(esAdmin || esDoctor) && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Pacientes Nuevos (Mes)</p>
              <h3 className="text-2xl font-bold text-slate-800">{metricas.pacientesNuevos}</h3>
            </div>
          </div>
        )}

        {/* Solo Secretaria y Admin ven deudas */}
        {(esAdmin || esSecretaria) && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-xs text-red-600 font-bold uppercase tracking-wider">Cuentas por Cobrar</p>
              <h3 className="text-2xl font-bold text-red-700">Bs. {metricas.totalPorCobrar.toFixed(2)}</h3>
            </div>
          </div>
        )}

        {/* 🔒 SOLO EL DUEÑO VE LOS INGRESOS DEL MES */}
        {esAdmin && (
          <div className="bg-gradient-to-br from-[#2651A3] to-sky-700 p-6 rounded-xl shadow-md border border-sky-800 flex items-center gap-4 text-white transform hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <CircleDollarSign size={24} />
            </div>
            <div>
              <p className="text-xs text-sky-100 font-bold uppercase tracking-wider">Ingresos del Mes</p>
              <h3 className="text-2xl font-bold">Bs. {metricas.ingresosMes.toFixed(2)}</h3>
            </div>
          </div>
        )}
      </div>

      {/* MÓDULOS INFERIORES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* AGENDA DEL DÍA (Ocupa 2 columnas si no hay panel derecho) */}
        <div className={`bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full ${!esSecretaria && !esAdmin ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#39ACB8]" /> Agenda de Hoy
            </h2>
            <Button variant="ghost" size="sm" onClick={() => router.push("/agenda")} className="text-[#2651A3]">
              Ver Calendario
            </Button>
          </div>
          
          <div className="space-y-3 flex-1 overflow-y-auto pr-2">
            {agendaHoy.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400 bg-slate-50 rounded-xl border border-dashed">
                <Calendar className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-sm font-medium">Agenda libre por el momento.</p>
              </div>
            ) : (
              agendaHoy.map((cita) => (
                <div key={cita.id} className="p-4 bg-white rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-all flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    <div className="bg-sky-50 text-sky-700 font-bold px-3 py-1.5 rounded-md text-sm border border-sky-100">
                      {cita.hora}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-800">{cita.pacienteNombre}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Activity className="w-3 h-3" /> {cita.motivo || "Consulta General"}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-white text-[#2651A3] border border-[#2651A3] hover:bg-[#2651A3] hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => router.push(`/pacientes/${cita.pacienteId}`)}
                  >
                    Abrir Ficha
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ALERTAS DE COBRO (Solo Secretaria y Admin) */}
        {(esAdmin || esSecretaria) && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 flex flex-col h-full lg:col-span-1">
            <h2 className="text-lg font-bold text-orange-700 mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Top Deudores
            </h2>
            <div className="space-y-3 flex-1">
              {alertasCobro.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-emerald-600 bg-emerald-50 rounded-xl">
                  <CircleDollarSign className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-sm font-bold">¡Finanzas saludables!</p>
                  <p className="text-xs">No hay deudas registradas.</p>
                </div>
              ) : (
                alertasCobro.map((deudor) => (
                  <div key={deudor.id} className="p-3 bg-orange-50 rounded-lg border border-orange-100 flex justify-between items-center hover:bg-orange-100 transition-colors cursor-pointer" onClick={() => router.push(`/pacientes/${deudor.id}`)}>
                    <div>
                      <p className="font-bold text-sm text-slate-800 truncate max-w-[120px]">{deudor.nombre}</p>
                      <p className="text-xs text-slate-500 font-mono">📱 {deudor.celular}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-600 font-bold text-sm">Bs. {deudor.deuda.toFixed(2)}</p>
                      <span className="text-[10px] text-orange-700 font-medium">Ver detalles &rarr;</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}