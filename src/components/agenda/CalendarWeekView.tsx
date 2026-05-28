"use client";

import React from "react";
import { format, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { es } from "date-fns/locale";
import { determinarColorPorMotivo } from "@/lib/agenda-constants";

interface CitaExtendida {
  id: string;
  pacienteNombre: string;
  horaInicio: string;
  horaFin: string;
  motivo: string;
  fecha: string;
  estado: string;
}

interface CalendarWeekViewProps {
  fechaSeleccionada: Date;
  citas: CitaExtendida[];
  cargando: boolean;
  onDiaClick: (dia: Date) => void;
  onCitaClick: (idCita: string) => void;
}

export default function CalendarWeekView({
  fechaSeleccionada,
  citas,
  cargando,
  onDiaClick,
  onCitaClick
}: CalendarWeekViewProps) {
  
  const weekStart = startOfWeek(fechaSeleccionada, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(fechaSeleccionada, { weekStartsOn: 1 });
  const diasSemana = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const nombresDias = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

  return (
    <div className="w-full flex-1 min-w-0 overflow-hidden flex flex-col bg-white h-full min-h-0">
      {/* Cabecera de días de la semana */}
      <div className="grid grid-cols-7 border-b border-gray-100 bg-white shrink-0">
        {diasSemana.map((dia, i) => {
          const esHoy = isSameDay(dia, new Date());
          const isSelected = isSameDay(dia, fechaSeleccionada);
          return (
            <div 
              key={i} 
              className={`py-3 text-center cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
              onClick={() => onDiaClick(dia)}
            >
              <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                {nombresDias[i]}
              </div>
              <div className={`mx-auto w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold ${esHoy ? 'bg-[#2651A3] text-white shadow-sm' : isSelected ? 'bg-blue-100 text-[#2651A3]' : 'text-slate-700'}`}>
                {format(dia, 'd')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grilla de la semana (1 fila, 7 columnas fluidas) */}
      {cargando ? (
        <div className="flex-1 flex items-center justify-center bg-slate-50/50">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-[#2651A3] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-slate-500">Cargando turnos de la semana...</p>
          </div>
        </div>
      ) : (
        <div className="w-full flex-1 min-w-0 min-h-0 grid grid-cols-7 bg-slate-200 gap-[1px] overflow-hidden">
          {diasSemana.map((dia, idx) => {
            const strDia = format(dia, 'yyyy-MM-dd');
            const citasDelDia = citas.filter(c => c.fecha === strDia).sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
            const isSelected = isSameDay(dia, fechaSeleccionada);

            return (
              <div 
                key={idx} 
                onClick={() => onDiaClick(dia)}
                className={`w-full h-full min-w-0 min-h-0 flex flex-col p-1 overflow-hidden transition-colors cursor-pointer group ${isSelected ? 'bg-blue-50/10' : 'bg-white hover:bg-slate-50/30'}`}
              >
                <div className="flex flex-col gap-1 overflow-y-auto flex-1 px-1 no-scrollbar pt-1">
                  {citasDelDia.map((cita) => {
                    const tipo = determinarColorPorMotivo(cita.motivo);
                    const inactiva = cita.estado === 'cancelada' || cita.estado === 'reprogramada';
                    
                    return (
                      <div 
                        key={cita.id}
                        onClick={(e) => { e.stopPropagation(); onCitaClick(cita.id); }}
                        className={`w-full min-w-0 overflow-hidden flex flex-col px-2 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-transform hover:scale-[1.01] shadow-sm border border-black/5 ${inactiva ? 'bg-gray-100 text-gray-400 line-through' : `${tipo.bg} ${tipo.text}`}`}
                        title={`${cita.horaInicio} - ${cita.pacienteNombre} (${cita.motivo})`}
                      >
                        <span className="opacity-90 font-bold mb-0.5">{cita.horaInicio}</span>
                        <span className="truncate">{cita.pacienteNombre}</span>
                        <span className="truncate opacity-70 text-[10px] mt-0.5">{cita.motivo}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
