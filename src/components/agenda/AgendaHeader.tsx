"use client";

import React from "react";
import { Search, Bell, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const mesAnterior = () => onFechaSeleccionada(subMonths(fechaSeleccionada, 1));
  const mesSiguiente = () => onFechaSeleccionada(addMonths(fechaSeleccionada, 1));
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

      {/* Izquierda: Buscador y Botón Nueva Cita */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <Button 
          onClick={onNuevaCita} 
          className="btn-breathe shrink-0 bg-[#2651A3] hover:bg-[#1e4082] text-white transition-all rounded-lg flex gap-1.5 items-center justify-center font-bold text-sm h-9 px-4"
        >
          <Plus className="w-4 h-4" />
          Nueva Cita
        </Button>
        <div className="relative flex-1 w-full max-w-[200px] sm:max-w-xs min-w-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <Input 
            type="text" 
            placeholder="Buscar paciente..." 
            className="pl-9 bg-white border-slate-200 focus-visible:ring-[#2651A3] rounded-lg shadow-sm text-sm h-9"
          />
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
            <Button variant="ghost" size="icon" onClick={mesAnterior} className="h-7 w-7 rounded-md hover:bg-slate-50 hover:shadow-sm transition-all text-slate-500">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={mesSiguiente} className="h-7 w-7 rounded-md hover:bg-slate-50 hover:shadow-sm transition-all text-slate-500">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Derecha: Vistas, Notificaciones, Usuario */}
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

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-slate-600 rounded-full">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </Button>
          
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-slate-800 leading-tight">Dra.</span>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Odontóloga</span>
            </div>
            <Avatar className="h-9 w-9 border border-slate-200 shadow-sm">
              <AvatarImage src="" />
              <AvatarFallback className="bg-[#e0e7ff] text-[#2651A3] font-bold text-xs">DRA</AvatarFallback>
            </Avatar>
          </div>
        </div>

      </div>
    </header>
  );
}
