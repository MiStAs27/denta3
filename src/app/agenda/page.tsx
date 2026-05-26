"use client";

import { useState, useEffect } from "react";
import { format, addDays, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Cita } from "@/types/cita";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, ChevronLeft, ChevronRight, Pencil, XCircle, MessageCircle } from "lucide-react";
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

export default function AgendaCompactaPage() {
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date());
  const [citasDelDia, setCitasDelDia] = useState<CitaUI[]>([]);
  const [cargando, setCargando] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [citaAEditar, setCitaAEditar] = useState<CitaUI | null>(null);

  const diasDeLaSemana = Array.from({ length: 7 }).map((_, i) => addDays(fechaSeleccionada, i - 3));
  const semanaAnterior = () => setFechaSeleccionada(prev => subDays(prev, 7));
  const semanaSiguiente = () => setFechaSeleccionada(prev => addDays(prev, 7));

  const buscarCitas = async () => {
    if (!fechaSeleccionada) return;
    setCargando(true);
    try {
      const fechaStr = format(fechaSeleccionada, 'yyyy-MM-dd');
      const q = query(collection(db, "citas"), where("fecha", "==", fechaStr));
      const snapshot = await getDocs(q);
      
      const citas: CitaUI[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as CitaUI;
        // Convertir "programada" vieja a "pendiente" visualmente
        if (data.estado === "programada") data.estado = "pendiente";
        
        const docInfo = ESPECIALISTAS.find(e => e.id === data.especialistaId) || ESPECIALISTAS[0];
        citas.push({ ...data, id: doc.id, especialistaNombre: docInfo.nombre, colorBg: docInfo.bg, colorText: docInfo.text });
      });

      citas.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
      setCitasDelDia(citas);
    } catch (error) {
      console.error("Error al buscar citas:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    buscarCitas();
  }, [fechaSeleccionada]);

  const enviarWhatsApp = (nombrePaciente: string, hora: string) => {
    const mensaje = encodeURIComponent(`Hola ${nombrePaciente}, nos comunicamos de la clínica dental para recordarle su turno hoy a las ${hora}. ¿Nos confirma su asistencia?`);
    window.open(`https://wa.me/?text=${mensaje}`, '_blank');
  };

  const cancelarCita = async (idCita: string | undefined, nombrePaciente: string) => {
    if (!idCita) return;
    const confirmar = window.confirm(`¿Estás seguro que deseas CANCELAR el turno de ${nombrePaciente}?`);
    if (confirmar) {
      await updateDoc(doc(db, "citas", idCita), { estado: "cancelada" });
      buscarCitas();
    }
  };

  const editarCita = (idCita: string | undefined) => {
    const citaSeleccionada = citasDelDia.find(c => c.id === idCita);
    if (citaSeleccionada) setCitaAEditar(citaSeleccionada);
  };

  // Función para renderizar el estilo del Estado
  const renderEstadoBadge = (estado: string, fechaReprogramada?: string) => {
    switch(estado) {
      case 'confirmada': 
        return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold border border-green-200">Confirmado</span>;
      case 'cancelada': 
        return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-md text-xs font-bold border border-red-200">Cancelado</span>;
      case 'reprogramada': 
        return (
          <div className="flex flex-col items-center">
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-xs font-bold border border-purple-200">Reprogramado</span>
            {fechaReprogramada && <span className="text-[10px] text-gray-500 mt-0.5">para el {format(new Date(`${fechaReprogramada}T00:00:00`), 'dd/MM', { locale: es })}</span>}
          </div>
        );
      case 'completada': 
        return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-bold border border-gray-200">Completado</span>;
      default: // Pendiente
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md text-xs font-bold border border-yellow-200">Pendiente</span>;
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4 flex flex-col h-[90vh]">
      
      <div className="flex justify-between items-center shrink-0">
        <h1 className="text-2xl font-bold text-[#2651A3]">Agenda</h1>
        <Button className="bg-[#39ACB8] hover:bg-[#2c8892] h-9" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Nuevo Turno</span>
        </Button>
      </div>

      {/* CARRUSEL DE CALENDARIO */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-2 shrink-0 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={semanaAnterior} className="h-8 w-8 shrink-0 hover:bg-gray-100"><ChevronLeft className="w-5 h-5 text-gray-600" /></Button>
        <div className="flex gap-1 md:gap-2 overflow-x-auto w-full justify-center px-2">
          {diasDeLaSemana.map((dia, index) => {
            const isSelected = format(dia, 'yyyy-MM-dd') === format(fechaSeleccionada, 'yyyy-MM-dd');
            return (
              <div key={index} onClick={() => setFechaSeleccionada(dia)} className={`flex flex-col items-center justify-center min-w-[3.5rem] py-1.5 rounded-md cursor-pointer transition-all border ${isSelected ? 'bg-[#2651A3] border-[#2651A3] text-white shadow-md transform scale-105' : 'bg-gray-50 border-gray-100 hover:bg-blue-50 text-gray-600'}`}>
                <span className={`text-[10px] font-medium uppercase tracking-wider ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>{format(dia, "EEE", { locale: es })}</span>
                <span className={`text-base font-bold mt-0.5 ${isSelected ? 'text-white' : 'text-gray-800'}`}>{format(dia, "d")}</span>
              </div>
            );
          })}
        </div>
        <Button variant="ghost" size="icon" onClick={semanaSiguiente} className="h-8 w-8 shrink-0 hover:bg-gray-100"><ChevronRight className="w-5 h-5 text-gray-600" /></Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col flex-1 min-h-0 overflow-hidden">
        
        <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-800 capitalize">{format(fechaSeleccionada, "EEEE, d 'de' MMMM", { locale: es })}</h2>
          <span className="text-xs bg-white border border-gray-200 px-2.5 py-1 rounded-md font-semibold text-[#2651A3]">{citasDelDia.length} turnos</span>
        </div>

        <ScrollArea className="flex-1">
          {cargando ? (
            <div className="p-8 text-center text-sm font-medium text-gray-500 animate-pulse">Cargando turnos...</div>
          ) : citasDelDia.length === 0 ? (
            <div className="p-12 text-center text-sm font-medium text-gray-400">No hay turnos programados para este día.</div>
          ) : (
            <div className="flex flex-col">
              
              {/* ENCABEZADOS DE 5 COLUMNAS */}
              <div className="hidden sm:flex items-center px-4 py-3 bg-gray-50/50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b gap-4">
                <div className="w-16">Hora</div>
                <div className="flex-1">Paciente y Motivo</div>
                <div className="w-32 text-center">Especialista</div>
                <div className="w-28 text-center">Estado</div>
                <div className="w-28 text-center">Acciones</div>
              </div>

              {citasDelDia.map((cita) => {
                // Lógica de tachado
                const estaInactiva = cita.estado === 'cancelada' || cita.estado === 'reprogramada';
                // Tooltip (Hover)
                const tooltipText = cita.estado === 'reprogramada' && cita.fechaReprogramada ? `Reprogramado para: ${cita.fechaReprogramada}` : "";

                return (
                  <div key={cita.id} className="flex flex-col sm:flex-row sm:items-center px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 gap-3 sm:gap-4">
                    
                    {/* Hora */}
                    <div className={`w-full sm:w-16 font-bold text-sm ${estaInactiva ? 'text-gray-400' : 'text-gray-900'}`}>
                      {cita.horaInicio}
                    </div>

                    {/* Paciente */}
                    <div className="flex-1 min-w-0" title={tooltipText}>
                      <p className={`text-sm font-bold truncate ${estaInactiva ? 'text-gray-400 line-through' : 'text-[#2651A3]'}`}>
                        {cita.pacienteNombre}
                      </p>
                      <p className={`text-xs truncate mt-0.5 ${estaInactiva ? 'text-gray-300' : 'text-gray-500'}`}>{cita.motivo}</p>
                    </div>

                    {/* Especialista */}
                    <div className="w-full sm:w-32 sm:text-center">
                      <span className={`inline-block px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${estaInactiva ? 'bg-gray-100 text-gray-400' : `${cita.colorBg} ${cita.colorText}`}`}>
                        {cita.especialistaNombre}
                      </span>
                    </div>

                    {/* NUEVA COLUMNA: Estado */}
                    <div className="w-full sm:w-28 flex sm:justify-center">
                      {renderEstadoBadge(cita.estado, cita.fechaReprogramada)}
                    </div>

                    {/* Acciones */}
                    <div className="w-full sm:w-28 flex justify-end sm:justify-center gap-1 border-t sm:border-t-0 pt-2 sm:pt-0 mt-1 sm:mt-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:bg-green-50" title="Enviar WhatsApp" onClick={() => enviarWhatsApp(cita.pacienteNombre, cita.horaInicio)}>
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:bg-blue-50" title="Editar / Reprogramar" onClick={() => editarCita(cita.id)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" title="Cancelar cita" onClick={() => cancelarCita(cita.id, cita.pacienteNombre)} disabled={estaInactiva}>
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      <ModalNuevaCita isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} fechaPreseleccionada={fechaSeleccionada} onCitaCreada={buscarCitas} />
      <ModalEditarCita isOpen={!!citaAEditar} onClose={() => setCitaAEditar(null)} cita={citaAEditar} onCitaActualizada={buscarCitas} />
    </div>
  );
}