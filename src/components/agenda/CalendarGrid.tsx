"use client";

import React from "react";
import { format, isSameMonth, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { es } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { determinarColorPorMotivo } from "@/lib/agenda-constants";

interface CitaExtendida {
  id: string;
  pacienteNombre: string;
  horaInicio: string;
  motivo: string;
  fecha: string;
  estado: string;
}

interface CalendarGridProps {
  fechaSeleccionada: Date;
  citas: CitaExtendida[];
  cargando: boolean;
  onDiaClick: (date: Date) => void;
  onCitaClick: (idCita: string) => void;
}

export default function CalendarGrid({
  fechaSeleccionada,
  citas,
  cargando,
  onDiaClick,
  onCitaClick,
}: CalendarGridProps) {
  
  // Calcular días del calendario mensual (incluyendo relleno de mes anterior y siguiente)
  const monthStart = startOfMonth(fechaSeleccionada);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Semana empieza en Lunes
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const diasDelCalendario = eachDayOfInterval({ start: startDate, end: endDate });

  const diasSemana = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white">
      {/* Cabecera de días de la semana */}
      <div className="grid grid-cols-7 border-b border-gray-100 bg-white shrink-0">
        {diasSemana.map((dia, i) => (
          <div key={i} className="py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
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
        <ScrollArea className="flex-1">
          <div className="grid grid-cols-7 auto-rows-[minmax(120px,1fr)] bg-gray-100 border-l border-gray-100 gap-[1px]">
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
                  className={`relative flex flex-col bg-white p-1.5 transition-colors cursor-pointer group ${!esMesActual ? 'bg-gray-50/50 opacity-60' : 'hover:bg-gray-50/30'}`}
                >
                  <div className="flex justify-between items-start mb-1 px-1">
                    <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${esHoy ? 'bg-[#2651A3] text-white shadow-sm' : isSelected ? 'bg-blue-100 text-[#2651A3]' : esMesActual ? 'text-gray-700' : 'text-gray-400'}`}>
                      {format(dia, 'd')}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 overflow-y-auto overflow-x-hidden flex-1 px-0.5 no-scrollbar items-center md:items-stretch">
                    {citasMostradas.map((cita) => {
                      const tipo = determinarColorPorMotivo(cita.motivo);
                      const inactiva = cita.estado === 'cancelada' || cita.estado === 'reprogramada';
                      
                      return (
                        <div 
                          key={cita.id}
                          onClick={(e) => { e.stopPropagation(); onCitaClick(cita.id); }}
                          className={`flex items-center px-1 md:px-1.5 py-1 rounded-full md:rounded-md text-[10px] sm:text-xs font-semibold truncate cursor-pointer transition-transform hover:scale-[1.02] shadow-sm border border-black/5 justify-center md:justify-start w-3 h-3 md:w-auto md:h-auto mx-auto md:mx-0 ${inactiva ? 'bg-gray-100 text-gray-400 md:line-through' : `${tipo.bg} md:${tipo.text}`}`}
                          title={`${cita.horaInicio} - ${cita.pacienteNombre} (${cita.motivo})`}
                        >
                          <span className="opacity-90 mr-1 shrink-0 hidden md:inline">{cita.horaInicio}</span>
                          <span className="truncate hidden md:inline">{cita.pacienteNombre}</span>
                        </div>
                      );
                    })}

                    {citasOcultas > 0 && (
                      <div className="text-[10px] font-bold text-gray-500 text-center py-0.5 mt-auto hover:text-[#2651A3]">
                        +{citasOcultas} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
