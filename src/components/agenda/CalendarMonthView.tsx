"use client";

import React from "react";
import { format, isSameMonth, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { es } from "date-fns/locale";
import { determinarColorPorMotivo } from "@/lib/agenda-constants";

interface CitaExtendida {
  id: string;
  pacienteNombre: string;
  horaInicio: string;
  motivo: string;
  fecha: string;
  estado: string;
}

interface CalendarMonthViewProps {
  fechaSeleccionada: Date;
  citas: CitaExtendida[];
  cargando: boolean;
  onDiaClick: (dia: Date) => void;
  onCitaClick: (idCita: string) => void;
}

export default function CalendarMonthView({
  fechaSeleccionada,
  citas,
  cargando,
  onDiaClick,
  onCitaClick,
}: CalendarMonthViewProps) {
  
  // Calcular días del calendario mensual (incluyendo relleno de mes anterior y siguiente)
  const monthStart = startOfMonth(fechaSeleccionada);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Semana empieza en Lunes
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const diasDelCalendario = eachDayOfInterval({ start: startDate, end: endDate });

  const diasSemana = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
  const totalSemanas = diasDelCalendario.length / 7;

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 bg-white w-full">
      {/* Cabecera de días de la semana */}
      <div className="grid grid-cols-7 border-b border-gray-100 bg-white shrink-0">
        {diasSemana.map((dia, i) => (
          <div key={i} className="py-2 text-center text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">
            {dia}
          </div>
        ))}
      </div>

      {/* Grilla del calendario */}
      {cargando ? (
        <div className="flex-1 flex items-center justify-center bg-gray-50/50">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-[#2651A3] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-gray-500">Cargando turnos del mes...</p>
          </div>
        </div>
      ) : (
        <div className={`w-full flex-1 min-h-0 grid grid-cols-7 ${totalSemanas === 6 ? 'grid-rows-6' : 'grid-rows-5'} gap-[1px] bg-slate-200`}>
          {diasDelCalendario.map((dia, idx) => {
            const strDia = format(dia, 'yyyy-MM-dd');
            const citasDelDia = citas.filter(c => c.fecha === strDia).sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
            const esMesActual = isSameMonth(dia, monthStart);
            const esHoy = isSameDay(dia, new Date());
            const isSelected = isSameDay(dia, fechaSeleccionada);

            // Límite de visualización de cápsulas (ej: mostramos 3 máximo, si hay más mostramos +X)
            const maxCitasVisibles = 3;
            const citasMostradas = citasDelDia.slice(0, maxCitasVisibles);
            const citasOcultas = citasDelDia.length - maxCitasVisibles;

            return (
              <div 
                key={idx} 
                onClick={() => onDiaClick(dia)}
                className={`w-full h-full min-w-0 min-h-0 flex flex-col p-1 overflow-hidden transition-colors cursor-pointer group ${!esMesActual ? 'bg-slate-50/50 opacity-60' : 'bg-white hover:bg-slate-50/50'}`}
              >
                <div className="flex justify-between items-start mb-0.5 px-0.5">
                  <span className={`text-[10px] sm:text-xs font-bold w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full ${esHoy ? 'bg-[#2651A3] text-white shadow-sm' : isSelected ? 'bg-blue-100 text-[#2651A3]' : esMesActual ? 'text-gray-700' : 'text-gray-400'}`}>
                    {format(dia, 'd')}
                  </span>
                </div>

                <div className="flex flex-col gap-0.5 overflow-hidden flex-1 px-0.5 items-center md:items-stretch">
                  {citasMostradas.map((cita) => {
                    const tipo = determinarColorPorMotivo(cita.motivo);
                    const inactiva = cita.estado === 'cancelada' || cita.estado === 'reprogramada';
                    
                    return (
                      <div 
                        key={cita.id}
                        onClick={(e) => { e.stopPropagation(); onCitaClick(cita.id); }}
                        className={`w-full block truncate whitespace-nowrap text-[11px] px-1.5 py-0.5 rounded-md font-medium border cursor-pointer transition-transform hover:scale-[1.01] ${inactiva ? 'bg-slate-100 text-slate-400 line-through' : `${tipo.bg} ${tipo.text}`}`}
                        title={`${cita.horaInicio} - ${cita.pacienteNombre} (${cita.motivo})`}
                      >
                        <span className="font-semibold mr-1">{cita.horaInicio}</span>
                        <span>{cita.pacienteNombre}</span>
                      </div>
                    );
                  })}

                  {citasOcultas > 0 && (
                    <div className="text-[9px] font-bold text-gray-500 text-center py-0 mt-auto hover:text-[#2651A3] truncate">
                      +{citasOcultas}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
