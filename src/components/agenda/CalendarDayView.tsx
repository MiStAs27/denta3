"use client";

import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { determinarColorPorEstado } from "@/lib/agenda-constants";
import { Clock, User } from "lucide-react";

interface CitaExtendida {
  id: string;
  pacienteNombre: string;
  horaInicio: string;
  horaFin: string;
  motivo: string;
  fecha: string;
  estado: string;
}

interface CalendarDayViewProps {
  fechaSeleccionada: Date;
  citas: CitaExtendida[];
  cargando: boolean;
  onCitaClick: (idCita: string) => void;
}

export default function CalendarDayView({
  fechaSeleccionada,
  citas,
  cargando,
  onCitaClick
}: CalendarDayViewProps) {
  
  const strDia = format(fechaSeleccionada, 'yyyy-MM-dd');
  const citasDelDia = citas.filter(c => c.fecha === strDia).sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

  return (
    <div className="w-full flex-1 min-w-0 overflow-hidden flex flex-col bg-white h-full min-h-0">
      {/* Cabecera del día */}
      <div className="border-b border-slate-100 bg-white shrink-0 py-4 px-6 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-800">
            {format(fechaSeleccionada, "EEEE, d 'de' MMMM", { locale: es })}
          </h3>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {citasDelDia.length} citas programadas
          </p>
        </div>
      </div>

      {/* Listado del día */}
      {cargando ? (
        <div className="flex-1 flex items-center justify-center bg-slate-50/50">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-[#2651A3] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-slate-500">Cargando turnos del día...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6">
          <div className="max-w-4xl mx-auto flex flex-col gap-3">
            {citasDelDia.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-slate-400" />
                </div>
                <h4 className="text-lg font-bold text-slate-700">No hay citas programadas</h4>
                <p className="text-slate-500">No tienes citas para este día. Disfruta tu tiempo libre o programa una nueva cita.</p>
              </div>
            ) : (
              citasDelDia.map((cita) => {
                const estiloClases = determinarColorPorEstado(cita.estado);
                const inactiva = cita.estado && (cita.estado.toLowerCase() === 'cancelada' || cita.estado.toLowerCase() === 'reprogramada');
                
                return (
                  <div 
                    key={cita.id}
                    onClick={(e) => { e.stopPropagation(); onCitaClick(cita.id); }}
                    className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 px-6 py-4 rounded-xl cursor-pointer transition-transform hover:scale-[1.01] shadow-sm border border-slate-200/60 ${estiloClases} ${inactiva ? 'opacity-60 grayscale' : ''}`}
                  >
                    <div className="flex flex-col items-center justify-center w-20 shrink-0">
                      <span className="text-lg font-bold text-slate-800">{cita.horaInicio}</span>
                      <span className="text-xs font-medium text-slate-400">{cita.horaFin}</span>
                    </div>

                    <div className="w-[2px] h-12 bg-slate-100 hidden sm:block"></div>

                    <div className="flex-1 flex flex-col">
                      <h4 className={`text-base font-bold ${inactiva ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                        {cita.pacienteNombre}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/50 border border-slate-200/50 text-slate-600`}>
                          {cita.motivo}
                        </span>
                        <span className="inline-flex items-center text-xs text-slate-500 font-medium">
                          <User className="w-3.5 h-3.5 mr-1" />
                          Dr. Asignado
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${estiloClases}`}>
                        {cita.estado ? cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1) : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
