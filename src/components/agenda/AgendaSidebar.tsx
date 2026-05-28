"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { ESPECIALISTAS, TIPOS_CITA_COLORS } from "@/lib/agenda-constants";
import { es } from "date-fns/locale";

interface AgendaSidebarProps {
  fechaSeleccionada: Date;
  onFechaSeleccionada: (fecha: Date | undefined) => void;
  onNuevaCita: () => void;
}

export default function AgendaSidebar({
  fechaSeleccionada,
  onFechaSeleccionada,
  onNuevaCita,
}: AgendaSidebarProps) {
  return (
    <div className="w-full lg:w-64 xl:w-72 flex flex-col md:flex-row lg:flex-col gap-4 lg:gap-6 bg-white border-b lg:border-b-0 lg:border-r border-gray-100 p-4 shrink-0 overflow-x-auto lg:overflow-y-auto lg:h-full">
      
      {/* Botón Nueva Cita (Siempre visible) */}
      <Button 
        onClick={onNuevaCita} 
        className="shrink-0 w-full md:w-auto lg:w-full bg-[#2651A3] hover:bg-[#1e4082] text-white shadow-md transition-all py-6 md:py-4 lg:py-6 rounded-xl flex gap-2 items-center justify-center font-bold text-base"
      >
        <Plus className="w-5 h-5" />
        Nueva Cita
      </Button>

      {/* Mini Calendario (Oculto en md, visible en lg) */}
      <div className="hidden lg:block bg-gray-50/50 rounded-xl p-2 border border-gray-100/50">
        <Calendar
          mode="single"
          selected={fechaSeleccionada}
          onSelect={(date) => {
            if (date) onFechaSeleccionada(date);
          }}
          locale={es}
          className="rounded-md mx-auto w-full"
          classNames={{
            months: "w-full",
            month: "w-full space-y-4",
            table: "w-full border-collapse",
            head_row: "grid grid-cols-7 gap-1",
            head_cell: "text-muted-foreground font-normal text-[0.8rem] text-center w-full",
            row: "grid grid-cols-7 gap-1 mt-2 w-full",
            cell: "text-center text-sm relative p-0 h-9 w-full flex items-center justify-center",
            day: "h-9 w-9 p-0 font-normal hover:bg-gray-100 rounded-md transition-colors m-auto",
            day_selected: "bg-[#2651A3] text-white hover:bg-[#2651A3] hover:text-white focus:bg-[#2651A3] focus:text-white font-bold",
            day_today: "bg-gray-200 text-gray-900 font-bold rounded-md",
          }}
        />
      </div>

      {/* Filtros por Médico */}
      <div className="flex flex-col gap-3 shrink-0">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden lg:block">Filtrar por Médico</h3>
        <div className="flex flex-row lg:flex-col gap-2 lg:gap-2">
          {ESPECIALISTAS.map((doc) => (
            <div key={doc.id} className="flex items-center space-x-2 bg-gray-50/50 lg:bg-transparent p-2 lg:p-1.5 rounded-lg border border-gray-100 lg:border-transparent transition-colors cursor-pointer shrink-0">
              <Checkbox id={`doc-${doc.id}`} defaultChecked className="data-[state=checked]:bg-[#2651A3] data-[state=checked]:border-[#2651A3]" />
              <label
                htmlFor={`doc-${doc.id}`}
                className="text-xs lg:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 cursor-pointer whitespace-nowrap"
              >
                {doc.nombre}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Tipos de Cita (Leyenda) */}
      <div className="flex flex-col gap-3 shrink-0">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden lg:block">Tipos de Cita</h3>
        <div className="flex flex-row lg:flex-col gap-3 lg:gap-2.5 flex-wrap">
          {TIPOS_CITA_COLORS.map((tipo, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-gray-50/50 lg:bg-transparent p-1.5 px-3 lg:p-0 rounded-full border border-gray-100 lg:border-transparent shrink-0">
              <div className={`w-3 h-3 lg:w-3 lg:h-3 rounded-full ${tipo.bg} shadow-sm border border-black/5`}></div>
              <span className="text-[11px] lg:text-sm text-gray-600 font-medium whitespace-nowrap">{tipo.tipo}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
