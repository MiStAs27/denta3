"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
// 🔒 IMPORTAMOS query y where PARA EL FILTRO DE SEGURIDAD
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  BarChart3, Download, DollarSign, Users, 
  TrendingUp, Activity, FileText, Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function ReportesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [cargando, setCargando] = useState(true);
  const [datosReporte, setDatosReporte] = useState({
    ingresosTotales: 0,
    deudaTotal: 0,
    totalPacientes: 0,
    pacientesNuevosMes: 0,
    tratamientosPopulares: [] as { nombre: string; cantidad: number }[],
  });

  useEffect(() => {
    // Protección de ruta: Solo Admins pueden ver los reportes financieros
    if (!authLoading && user?.rol !== 'TENANT_ADMIN' && user?.rol !== 'SUPER_ADMIN') {
      alert("Acceso denegado: Solo los administradores pueden ver los reportes.");
      router.push('/dashboard');
      return;
    }

    const generarReportes = async () => {
      // 🔒 REGLA SAAS: Si no hay llave de clínica, abortamos el cálculo
      if (!user?.tenantId) return; 
      
      try {
        const hoy = new Date();
        const mesActual = hoy.getMonth();
        const añoActual = hoy.getFullYear();

        // 1. ANALIZAR PACIENTES (SOLO LOS DE ESTA CLÍNICA)
        const qPacientes = query(
          collection(db, "pacientes"),
          where("tenantId", "==", user.tenantId) // 🔒 FILTRO APLICADO AQUÍ
        );
        const pacientesSnap = await getDocs(qPacientes);
        
        let deudaTotal = 0;
        let pacientesNuevosMes = 0;
        let totalPacientes = pacientesSnap.size;

        pacientesSnap.forEach((doc) => {
          const data = doc.data();
          if (data.saldoPendiente && data.saldoPendiente > 0) {
            deudaTotal += data.saldoPendiente;
          }
          
          if (data.fechaCreacion) {
            const fechaDoc = new Date(data.fechaCreacion);
            if (fechaDoc.getMonth() === mesActual && fechaDoc.getFullYear() === añoActual) {
              pacientesNuevosMes++;
            }
          }
        });

        // 2. ANALIZAR FINANZAS Y TRATAMIENTOS
        let ingresosTotales = 0;
        const conteoTratamientos: Record<string, number> = {};

        // Recorremos SOLO los pacientes de esta clínica
        // Optimización: Usamos Promise.all para que las subcolecciones carguen mucho más rápido
        const promesasPresupuestos = pacientesSnap.docs.map(pacienteDoc => 
          getDocs(collection(db, "pacientes", pacienteDoc.id, "presupuestos"))
        );
        
        const resultadosPresupuestos = await Promise.all(promesasPresupuestos);

        resultadosPresupuestos.forEach((presupuestosSnap) => {
          presupuestosSnap.forEach((presupuestoDoc) => {
            const presData = presupuestoDoc.data();
            
            // Sumar ingresos reales (dinero que ya entró)
            if (presData.abonado) ingresosTotales += presData.abonado;

            // Contar tratamientos para ver cuáles son los más vendidos
            if (presData.tratamiento) {
              const nombreTratamiento = presData.tratamiento.toUpperCase().trim();
              conteoTratamientos[nombreTratamiento] = (conteoTratamientos[nombreTratamiento] || 0) + 1;
            }
          });
        });

        // Convertir el conteo de tratamientos a un array ordenado para el ranking
        const rankingTratamientos = Object.entries(conteoTratamientos)
          .map(([nombre, cantidad]) => ({ nombre, cantidad }))
          .sort((a, b) => b.cantidad - a.cantidad)
          .slice(0, 5); // Tomamos el Top 5

        setDatosReporte({
          ingresosTotales,
          deudaTotal,
          totalPacientes,
          pacientesNuevosMes,
          tratamientosPopulares: rankingTratamientos,
        });

      } catch (error) {
        console.error("Error generando reportes:", error);
      } finally {
        setCargando(false);
      }
    };

    if (!authLoading) {
      generarReportes();
    }
  }, [user, authLoading, router]);

  const handleExportarPDF = () => {
    alert("Función de exportar PDF en construcción...");
  };

  if (authLoading || cargando) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-[#2651A3] gap-3">
        <Loader2 className="w-10 h-10 animate-spin" />
        <p className="font-bold">Procesando inteligencia de negocios...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in">
      
      {/* CABECERA */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="text-[#39ACB8] w-6 h-6" /> Informes y Analíticas
          </h1>
          <p className="text-slate-500 text-sm mt-1">Resumen del rendimiento financiero y clínico del consultorio.</p>
        </div>
        <Button onClick={handleExportarPDF} className="bg-[#2651A3] hover:bg-[#1e4082]">
          <Download className="w-4 h-4 mr-2" /> Exportar Resumen
        </Button>
      </div>

      {/* MÉTRICAS FINANCIERAS PRINCIPALES */}
      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mt-8">
        <DollarSign className="w-5 h-5 text-emerald-600" /> Rendimiento Financiero
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl shadow-sm">
          <p className="text-sm font-bold text-emerald-700 uppercase mb-1">Ingresos Totales (Recaudado)</p>
          <h3 className="text-3xl font-bold text-emerald-800">Bs. {datosReporte.ingresosTotales.toFixed(2)}</h3>
          <p className="text-xs text-emerald-600 mt-2">Dinero real ingresado por caja en tratamientos.</p>
        </div>
        
        <div className="bg-red-50 border border-red-200 p-6 rounded-xl shadow-sm">
          <p className="text-sm font-bold text-red-700 uppercase mb-1">Cuentas por Cobrar (Deuda en calle)</p>
          <h3 className="text-3xl font-bold text-red-800">Bs. {datosReporte.deudaTotal.toFixed(2)}</h3>
          <p className="text-xs text-red-600 mt-2">Suma total de saldos pendientes de todos los pacientes.</p>
        </div>
      </div>

      {/* MÉTRICAS CLÍNICAS Y CRECIMIENTO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6">
        
        {/* Crecimiento de Pacientes */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-[#39ACB8]" /> Crecimiento de Pacientes
          </h3>
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-[#2651A3]">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-700">Pacientes Históricos</p>
                  <p className="text-xs text-slate-500">Total registrados en el sistema</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-slate-800">{datosReporte.totalPacientes}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-700">Pacientes Nuevos (Este mes)</p>
                  <p className="text-xs text-slate-500">Adquisición reciente</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-emerald-600">+{datosReporte.pacientesNuevosMes}</span>
            </div>
          </div>
        </div>

        {/* Ranking de Tratamientos */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
            <FileText className="w-5 h-5 text-[#2651A3]" /> Top 5 Tratamientos más realizados
          </h3>
          <div className="space-y-4">
            {datosReporte.tratamientosPopulares.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">No hay datos suficientes de tratamientos.</p>
            ) : (
              datosReporte.tratamientosPopulares.map((tratamiento, index) => {
                const maxCantidad = datosReporte.tratamientosPopulares[0].cantidad;
                const porcentaje = (tratamiento.cantidad / maxCantidad) * 100;
                
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-slate-700">{index + 1}. {tratamiento.nombre}</span>
                      <span className="font-medium text-slate-500">{tratamiento.cantidad} ventas</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className="bg-[#39ACB8] h-2 rounded-full transition-all duration-1000" 
                        style={{ width: `${porcentaje}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}