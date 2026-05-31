"use client";

import { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Cita } from "@/types/cita";
import { useAuth } from "@/context/AuthContext"; // 🔥 Importamos Auth

import AgendaHeader from "@/components/agenda/AgendaHeader";
import CalendarMonthView from "@/components/agenda/CalendarMonthView";
import CalendarWeekView from "@/components/agenda/CalendarWeekView";
import CalendarDayView from "@/components/agenda/CalendarDayView";
import ModalNuevaCita from "@/components/agenda/ModalNuevaCita";
import ModalEditarCita from "@/components/agenda/ModalEditarCita";

interface CitaUI extends Omit<Cita, "id"> {
  id: string;
  especialistaNombre?: string;
  colorBg?: string;
  colorText?: string;
  fechaReprogramada?: string;
}

const ESPECIALISTAS = [
  {
    id: "doc_1",
    nombre: "Dr. Carlos Ruiz",
    bg: "bg-blue-100",
    text: "text-blue-700",
  },
  {
    id: "doc_2",
    nombre: "Dra. Ana López",
    bg: "bg-purple-100",
    text: "text-purple-700",
  },
];

export default function AgendaPage() {
  const { user } = useAuth(); // 🔥 Extraemos el usuario actual

  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date());
  const [vista, setVista] = useState<"mes" | "semana" | "dia">("mes");
  const [citasDelMes, setCitasDelMes] = useState<CitaUI[]>([]);
  const [cargando, setCargando] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [citaAEditar, setCitaAEditar] = useState<CitaUI | null>(null);

  const buscarCitas = async () => {
    // 🔥 Si no hay fecha o si el usuario no tiene clínica, frenamos la consulta
    if (!fechaSeleccionada || !user?.tenantId) return;

    setCargando(true);
    try {
      const monthStart = startOfMonth(fechaSeleccionada);
      const monthEnd = endOfMonth(monthStart);
      const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
      const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

      const startStr = format(startDate, "yyyy-MM-dd");
      const endStr = format(endDate, "yyyy-MM-dd");

      // 🔥 CONSULTA MULTI-TENANT: Buscamos por clínica Y por rango de fechas
      const q = query(
        collection(db, "citas"),
        where("tenantId", "==", user.tenantId), // <-- La llave del candado
        where("fecha", ">=", startStr),
        where("fecha", "<=", endStr),
      );

      const snapshot = await getDocs(q);

      const citas: CitaUI[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as CitaUI;
        if (data.estado === "programada") data.estado = "pendiente";

        const docInfo =
          ESPECIALISTAS.find((e) => e.id === data.especialistaId) ||
          ESPECIALISTAS[0];
        citas.push({ ...data, id: doc.id, especialistaNombre: docInfo.nombre });
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
  }, [format(fechaSeleccionada, "yyyy-MM"), user?.tenantId]); // 🔥 Agregamos user.clinicId como dependencia

  const editarCita = (idCita: string) => {
    const citaSeleccionada = citasDelMes.find((c) => c.id === idCita);
    if (citaSeleccionada) setCitaAEditar(citaSeleccionada);
  };

  const handleDiaClick = (date: Date) => {
    setFechaSeleccionada(date);
    if (vista === "mes") {
      setVista("dia");
    }
  };

  return (
    <div className="flex-1 min-w-0 h-screen overflow-hidden flex flex-col bg-white">
      {/* ... (El resto del renderizado queda igual) ... */}
      <AgendaHeader
        fechaSeleccionada={fechaSeleccionada}
        onFechaSeleccionada={setFechaSeleccionada}
        vista={vista}
        setVista={setVista}
        onNuevaCita={() => setIsModalOpen(true)}
      />

      <div className="flex-1 p-4 overflow-hidden flex flex-col min-h-0 w-full min-w-0">
        <div className="flex-1 rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col bg-white w-full min-w-0">
          {vista === "mes" && (
            <CalendarMonthView
              fechaSeleccionada={fechaSeleccionada}
              citas={citasDelMes}
              cargando={cargando}
              onDiaClick={handleDiaClick}
              onCitaClick={editarCita}
            />
          )}
          {vista === "semana" && (
            <CalendarWeekView
              fechaSeleccionada={fechaSeleccionada}
              citas={citasDelMes}
              cargando={cargando}
              onDiaClick={handleDiaClick}
              onCitaClick={editarCita}
            />
          )}
          {vista === "dia" && (
            <CalendarDayView
              fechaSeleccionada={fechaSeleccionada}
              citas={citasDelMes}
              cargando={cargando}
              onCitaClick={editarCita}
            />
          )}
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
