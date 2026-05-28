"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Users, Calendar, CircleDollarSign, AlertCircle, 
  TrendingUp, Activity, ArrowRight, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Estados reales para guardar los datos de Firebase
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [metricas, setMetricas] = useState({
    citasHoy: 0,
    pacientesNuevos: 0,
    totalPorCobrar: 0,
  });
  
  const [alertasCobro, setAlertasCobro] = useState<any[]>([]);
  const [agendaHoy, setAgendaHoy] = useState<any[]>([]);

  // Función para traer los datos reales
  useEffect(() => {
    const cargarDatosReales = async () => {
      if (!user) return;
      
      try {
        const hoy = new Date();
        const mesActual = hoy.getMonth();
        const añoActual = hoy.getFullYear();
        // Formato YYYY-MM-DD para buscar citas de hoy
        const fechaHoyStr = hoy.toISOString().split('T')[0]; 

        // 1. Analizar Pacientes (Para deudas y pacientes nuevos)
        const pacientesSnapshot = await getDocs(collection(db, "pacientes"));
        let totalDeudaCalculada = 0;
        let nuevosEsteMesCalculado = 0;
        const listaDeudores: any[] = [];

        pacientesSnapshot.forEach((doc) => {
          const data = doc.data();

          // A. Sumar Deudas y llenar lista de Alertas
          if (data.saldoPendiente && data.saldoPendiente > 0) {
            totalDeudaCalculada += data.saldoPendiente;
            listaDeudores.push({ 
              id: doc.id, 
              nombre: data.nombre, 
              deuda: data.saldoPendiente,
              celular: data.celular || 'S/N'
            });
          }

          // B. Contar pacientes nuevos del mes
          if (data.fechaCreacion) {
            const fechaDoc = new Date(data.fechaCreacion);
            if (fechaDoc.getMonth() === mesActual && fechaDoc.getFullYear() === añoActual) {
              nuevosEsteMesCalculado++;
            }
          }
        });

        // Ordenar a los deudores para que salgan los que más deben primero
        listaDeudores.sort((a, b) => b.deuda - a.deuda);

        // 2. Traer Citas de Hoy (Busca en la colección 'citas')
        const citasDelDia: any[] = [];
        try {
          const citasQuery = query(collection(db, "citas"), where("fecha", "==", fechaHoyStr));
          const citasSnapshot = await getDocs(citasQuery);
          citasSnapshot.forEach(doc => citasDelDia.push({ id: doc.id, ...doc.data() }));
        } catch (error) {
          console.log("Nota: Aún no hay colección de citas o faltan registros hoy.");
        }

        // Guardar todo en los estados para que se dibuje en pantalla
        setMetricas({
          citasHoy: citasDelDia.length,
          pacientesNuevos: nuevosEsteMesCalculado,
          totalPorCobrar: totalDeudaCalculada
        });
        setAlertasCobro(listaDeudores.slice(0, 5)); // Solo mostramos los 5 mayores deudores
        setAgendaHoy(citasDelDia);

      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setCargandoDatos(false);
      }
    };

    if (!authLoading) {
      cargarDatosReales();
    }
  }, [user, authLoading]);


  if (authLoading || cargandoDatos) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-slate-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#2651A3]" />
        <p className="font-medium">Calculando métricas del consultorio...</p>
      </div>
    );
  }

  const esAdmin = user?.rol === 'TENANT_ADMIN' || user?.rol === 'SUPER_ADMIN';
  const esSecretaria = user?.rol === 'SECRETARIA';
  const esDoctor = user?.rol === 'DOCTOR';

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in">
      
      {/* 1. BIENVENIDA */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Hola, {user?.displayName || user?.email?.split('@')[0] || 'Usuario'}
          </h1>
          <p className="text-slate-500 flex items-center gap-2 mt-1">
            <span className="bg-[#2651A3] text-white px-2 py-0.5 rounded text-xs font-bold uppercase">
              {user?.rol?.replace('_', ' ') || 'Sin Rol'}
            </span>
            Resumen en tiempo real
          </p>
        </div>
        <Button onClick={() => router.push('/pacientes')} className="bg-[#39ACB8] hover:bg-[#2c8892]">
          Ver Pacientes <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* 2. TARJETAS DE MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-[#2651A3]">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Citas Hoy</p>
            <h3 className="text-2xl font-bold text-slate-800">{metricas.citasHoy}</h3>
          </div>
        </div>

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

        {(esAdmin || esSecretaria) && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                <CircleDollarSign size={24} />
              </div>
              <div>
                <p className="text-sm text-red-600 font-medium">Total en la calle (Por Cobrar)</p>
                <h3 className="text-2xl font-bold text-red-700">Bs. {metricas.totalPorCobrar.toFixed(2)}</h3>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. MÓDULOS INFERIORES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* AGENDA DEL DÍA (REAL) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#39ACB8]" /> Agenda de Hoy
          </h2>
          <div className="space-y-3 flex-1">
            {agendaHoy.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No hay citas registradas para hoy.</p>
            ) : (
              agendaHoy.map((cita) => (
                <div key={cita.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-sm text-slate-800">{cita.hora} - {cita.pacienteNombre}</p>
                    <p className="text-xs text-slate-500">{cita.motivo || 'Consulta General'}</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => router.push(`/pacientes/${cita.pacienteId}`)}>
                    Atender
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ALERTAS DE COBRO REALES */}
        {(esAdmin || esSecretaria) && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 flex flex-col h-full">
            <h2 className="text-lg font-bold text-orange-700 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Top 5 Deudores
            </h2>
            <div className="space-y-3 flex-1">
              {alertasCobro.length === 0 ? (
                <p className="text-sm text-emerald-600 text-center py-6 font-medium">¡Felicidades! No hay deudas pendientes.</p>
              ) : (
                alertasCobro.map((deudor) => (
                  <div key={deudor.id} className="p-3 bg-orange-50 rounded-lg border border-orange-100 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-sm text-slate-800">{deudor.nombre}</p>
                      <p className="text-xs text-slate-500">Cel: {deudor.celular}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-600 font-bold text-sm">Bs. {deudor.deuda.toFixed(2)}</p>
                      <Button variant="link" size="sm" className="h-auto p-0 text-orange-700 text-xs mt-1" onClick={() => router.push(`/pacientes/${deudor.id}`)}>
                        Ir a cobrar
                      </Button>
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