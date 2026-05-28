"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Cita } from "@/types/cita";

import AgendaSidebar from "@/components/agenda/AgendaSidebar";
import AgendaHeader from "@/components/agenda/AgendaHeader";
import CalendarGrid from "@/components/agenda/CalendarGrid";
import ModalNuevaCita from "@/components/agenda/ModalNuevaCita";
import ModalEditarCita from "@/components/agenda/ModalEditarCita";

interface CitaUI extends Omit<Cita, 'id'> {
  id: string; 
  especialistaNombre?: string;
  colorBg?: string;
  colorText?: string;
  fechaReprogramada?: string;
}

const ESPECIALISTAS = [
  { id: "doc_1", nombre: "Dr. Carlos Ruiz", bg: "bg-blue-100", text: "text-blue-700" },
  { id: "doc_2", nombre: "Dra. Ana López", bg: "bg-purple-100", text: "text-purple-700" },
];

export default function AgendaPage() {
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date());
  const [citasDelMes, setCitasDelMes] = useState<CitaUI[]>([]);
  const [cargando, setCargando] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [citaAEditar, setCitaAEditar] = useState<CitaUI | null>(null);

  const buscarCitas = async () => {
    if (!fechaSeleccionada) return;
    setCargando(true);
    try {
      // Calcular rango de fechas para el mes visible en la grilla
      const monthStart = startOfMonth(fechaSeleccionada);
      const monthEnd = endOfMonth(monthStart);
      const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
      const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

      const startStr = format(startDate, 'yyyy-MM-dd');
      const endStr = format(endDate, 'yyyy-MM-dd');

      const q = query(
        collection(db, "citas"), 
        where("fecha", ">=", startStr),
        where("fecha", "<=", endStr)
      );
      
      const snapshot = await getDocs(q);
      
      const citas: CitaUI[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as CitaUI;
        if (data.estado === "programada") data.estado = "pendiente";
        
        const docInfo = ESPECIALISTAS.find(e => e.id === data.especialistaId) || ESPECIALISTAS[0];
        citas.push({ ...data, id: doc.id, especialistaNombre: docInfo.nombre, colorBg: docInfo.bg, colorText: docInfo.text });
      });

      setCitasDelMes(citas);
    } catch (error) {
      console.error("Error al buscar citas:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    buscarCitas();
    // Dependemos de mes/año de fechaSeleccionada para no re-fetchear al cambiar de día en el mismo mes
  }, [format(fechaSeleccionada, 'yyyy-MM')]);

  const editarCita = (idCita: string) => {
    const citaSeleccionada = citasDelMes.find(c => c.id === idCita);
    if (citaSeleccionada) setCitaAEditar(citaSeleccionada);
  };

  const handleDiaClick = (date: Date) => {
    setFechaSeleccionada(date);
    // Opcional: setIsModalOpen(true); si queremos que al clickear el día se abra directo, 
    // pero la UI tiene un botón "Nueva Cita". Dejaremos que actualice el día seleccionado.
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-3.5rem)] md:h-screen w-full max-w-full bg-[#F5F8FA] overflow-hidden">
      
      {/* Sidebar Izquierdo Híbrido (Interno a la vista) */}
      <AgendaSidebar 
        fechaSeleccionada={fechaSeleccionada}
        onFechaSeleccionada={setFechaSeleccionada}
        onNuevaCita={() => setIsModalOpen(true)}
      />

      {/* Contenedor Principal Derecho */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <AgendaHeader 
          fechaSeleccionada={fechaSeleccionada}
          onFechaSeleccionada={setFechaSeleccionada}
        />
        
        {/* Contenedor fluido para la grilla */}
        <div className="flex-1 p-0 md:p-4 overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 md:rounded-xl shadow-none md:shadow-sm border-0 md:border border-gray-100 overflow-hidden flex flex-col bg-white">
            <CalendarGrid 
              fechaSeleccionada={fechaSeleccionada}
              citas={citasDelMes}
              cargando={cargando}
              onDiaClick={handleDiaClick}
              onCitaClick={editarCita}
            />
          </div>
        </div>
      </div>

      <ModalNuevaCita 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        fechaPreseleccionada={fechaSeleccionada} 
        onCitaCreada={buscarCitas} 
      />
      
      <ModalEditarCita 
        isOpen={!!citaAEditar} 
        onClose={() => setCitaAEditar(null)} 
        cita={citaAEditar} 
        onCitaActualizada={buscarCitas} 
      />
    </div>
  );
}