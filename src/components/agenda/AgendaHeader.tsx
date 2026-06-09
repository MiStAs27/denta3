"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";

interface AgendaHeaderProps {
  fechaSeleccionada: Date;
  onFechaSeleccionada: (fecha: Date) => void;
  vista: 'mes' | 'semana' | 'dia';
  setVista: (vista: 'mes' | 'semana' | 'dia') => void;
  onNuevaCita: () => void;
}

export default function AgendaHeader({
  fechaSeleccionada,
  onFechaSeleccionada,
  vista,
  setVista,
  onNuevaCita
}: AgendaHeaderProps) {
  const moverAnterior = () => {
    if (vista === 'mes') onFechaSeleccionada(subMonths(fechaSeleccionada, 1));
    else if (vista === 'semana') onFechaSeleccionada(subWeeks(fechaSeleccionada, 1));
    else if (vista === 'dia') onFechaSeleccionada(subDays(fechaSeleccionada, 1));
  };

  const moverSiguiente = () => {
    if (vista === 'mes') onFechaSeleccionada(addMonths(fechaSeleccionada, 1));
    else if (vista === 'semana') onFechaSeleccionada(addWeeks(fechaSeleccionada, 1));
    else if (vista === 'dia') onFechaSeleccionada(addDays(fechaSeleccionada, 1));
  };

  const hoy = () => onFechaSeleccionada(new Date());

  return (
    <header className="w-full min-w-0 flex flex-col sm:flex-row items-center justify-between px-4 md:px-6 py-2 sm:h-16 bg-[#f8fafc] border-b border-slate-100 gap-2 shrink-0 overflow-hidden">
      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
          50% { transform: scale(1.03); box-shadow: 0 4px 6px -1px rgb(38 81 163 / 0.2); }
        }
        .btn-breathe { animation: breathe 3s ease-in-out infinite; }
        .btn-breathe:hover { animation: none; transform: scale(1.02); }
      `}</style>

      {/* Izquierda: Botón Nueva Cita y Leyenda */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <Button 
          onClick={onNuevaCita} 
          className="btn-breathe shrink-0 bg-[#2651A3] hover:bg-[#1e4082] text-white transition-all rounded-lg flex gap-1.5 items-center justify-center font-bold text-sm h-9 px-4"
        >
          <Plus className="w-4 h-4" />
          Nueva Cita
        </Button>

        {/* Leyenda de Estados */}
        <div className="hidden xl:flex items-center gap-4 ml-6">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div>
            <span className="text-xs font-medium text-slate-500">Pendiente</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
            <span className="text-xs font-medium text-slate-500">Confirmada</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
            <span className="text-xs font-medium text-slate-500">Reprogramada</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
            <span className="text-xs font-medium text-slate-500">Cancelada</span>
          </div>
        </div>
      </div>

      {/* Centro: Controles de Navegación del Mes */}
      <div className="flex items-center gap-3 sm:gap-5 shrink-0 justify-center">
        <Button onClick={hoy} className="font-bold bg-[#2651A3] hover:bg-[#1e4082] text-white transition-colors rounded-lg px-4 h-9 shadow-sm">
          Hoy
        </Button>
        <div className="flex items-center gap-2">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 capitalize text-center truncate px-1">
            {format(fechaSeleccionada, "MMMM yyyy", { locale: es })}
          </h2>
          <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-slate-200 shadow-sm">
            <Button variant="ghost" size="icon" onClick={moverAnterior} className="h-7 w-7 rounded-md hover:bg-slate-50 hover:shadow-sm transition-all text-slate-500">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={moverSiguiente} className="h-7 w-7 rounded-md hover:bg-slate-50 hover:shadow-sm transition-all text-slate-500">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Derecha: Vistas */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0 justify-end">
        
        {/* Selectores de vista */}
        <div className="hidden lg:flex bg-slate-200/50 p-1 rounded-lg border border-slate-100 shadow-inner gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setVista('mes')}
            className={`rounded-md font-bold h-7 px-4 transition-colors ${vista === 'mes' ? 'bg-white shadow-sm text-[#2651A3]' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Mes
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setVista('semana')}
            className={`rounded-md font-bold h-7 px-4 transition-colors ${vista === 'semana' ? 'bg-white shadow-sm text-[#2651A3]' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Semana
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setVista('dia')}
            className={`rounded-md font-bold h-7 px-4 transition-colors ${vista === 'dia' ? 'bg-white shadow-sm text-[#2651A3]' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Día
          </Button>
        </div>

      </div>
    </header>
  );
}
