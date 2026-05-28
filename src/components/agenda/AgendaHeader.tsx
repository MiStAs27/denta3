"use client";

import React from "react";
import { Search, Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AgendaHeaderProps {
  fechaSeleccionada: Date;
  onFechaSeleccionada: (fecha: Date) => void;
}

export default function AgendaHeader({
  fechaSeleccionada,
  onFechaSeleccionada,
}: AgendaHeaderProps) {
  const mesAnterior = () => onFechaSeleccionada(subMonths(fechaSeleccionada, 1));
  const mesSiguiente = () => onFechaSeleccionada(addMonths(fechaSeleccionada, 1));
  const hoy = () => onFechaSeleccionada(new Date());

  return (
    <header className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100 gap-4 shrink-0 h-auto sm:h-20">
      
      {/* Izquierda: Buscador */}
      <div className="relative w-full sm:w-72 lg:w-96">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <Input 
          type="text" 
          placeholder="Buscar paciente..." 
          className="pl-10 bg-gray-50/50 border-gray-200 focus-visible:ring-[#2651A3] rounded-full shadow-sm"
        />
      </div>

      {/* Centro: Controles de Navegación del Mes */}
      <div className="flex items-center gap-2 sm:gap-4 order-last sm:order-none w-full sm:w-auto justify-between sm:justify-center">
        <Button variant="outline" size="sm" onClick={hoy} className="font-bold text-gray-600 rounded-full px-4 h-9 shadow-sm border-gray-200 hover:bg-gray-50">
          Hoy
        </Button>
        <div className="flex items-center gap-1 bg-gray-50/80 p-1 rounded-full border border-gray-100 shadow-sm">
          <Button variant="ghost" size="icon" onClick={mesAnterior} className="h-7 w-7 rounded-full hover:bg-white hover:shadow-sm transition-all text-gray-500">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={mesSiguiente} className="h-7 w-7 rounded-full hover:bg-white hover:shadow-sm transition-all text-gray-500">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <h2 className="text-lg font-bold text-[#2651A3] capitalize min-w-[120px] text-center">
          {format(fechaSeleccionada, "MMMM yyyy", { locale: es })}
        </h2>
      </div>

      {/* Derecha: Vistas, Notificaciones, Usuario */}
      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
        
        {/* Selectores de vista (Estético por ahora) */}
        <div className="hidden lg:flex bg-gray-50/80 p-1 rounded-full border border-gray-100 shadow-sm gap-1">
          <Button variant="ghost" size="sm" className="bg-white shadow-sm rounded-full text-[#2651A3] font-bold h-7 px-4">Mes</Button>
          <Button variant="ghost" size="sm" className="rounded-full text-gray-500 font-medium h-7 px-4 hover:text-gray-900">Semana</Button>
          <Button variant="ghost" size="sm" className="rounded-full text-gray-500 font-medium h-7 px-4 hover:text-gray-900">Día</Button>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-gray-600 rounded-full">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </Button>
          
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-gray-800 leading-tight">Dra.</span>
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Odontóloga</span>
            </div>
            <Avatar className="h-9 w-9 border border-gray-200 shadow-sm">
              <AvatarImage src="" />
              <AvatarFallback className="bg-[#e0e7ff] text-[#2651A3] font-bold text-xs">DRA</AvatarFallback>
            </Avatar>
          </div>
        </div>

      </div>
    </header>
  );
}
