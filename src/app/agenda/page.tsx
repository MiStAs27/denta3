"use client";

import ModalNuevaCita from "@/components/agenda/ModalNuevaCita";
import { useState, useEffect } from "react";
import { format, addDays, subDays, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Cita } from "@/types/cita";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Clock,
  Phone,
  CheckCircle2,
  XCircle,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
} from "lucide-react";

interface CitaUI extends Cita {
  especialistaNombre?: string;
  colorHex?: string;
}

const ESPECIALISTAS = [
  {
    id: "doc_1",
    nombre: "Dr. Carlos Ruiz",
    color: "bg-blue-500",
    borde: "border-blue-500",
    text: "text-blue-700",
  },
  {
    id: "doc_2",
    nombre: "Dra. Ana López",
    color: "bg-purple-500",
    borde: "border-purple-500",
    text: "text-purple-700",
  },
];

export default function AgendaPremiumPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date());
  const [semanaActual, setSemanaActual] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  ); // Inicia en Lunes
  const [citasDelDia, setCitasDelDia] = useState<CitaUI[]>([]);
  const [cargando, setCargando] = useState(false);
  const [doctoresVisibles, setDoctoresVisibles] = useState<string[]>(
    ESPECIALISTAS.map((d) => d.id),
  );

  // Generar los 7 días de la semana a mostrar en la barra superior
  const diasDeLaSemana = Array.from({ length: 7 }).map((_, i) =>
    addDays(semanaActual, i),
  );

  // Navegación de semanas
  const semanaAnterior = () => setSemanaActual((prev) => subDays(prev, 7));
  const semanaSiguiente = () => setSemanaActual((prev) => addDays(prev, 7));

  const buscarCitas = async () => {
    if (!fechaSeleccionada) return;
    setCargando(true);

    try {
      const fechaStr = format(fechaSeleccionada, "yyyy-MM-dd");
      const q = query(collection(db, "citas"), where("fecha", "==", fechaStr));
      const snapshot = await getDocs(q);

      const citas: CitaUI[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as Cita;
        const docInfo =
          ESPECIALISTAS.find((e) => e.id === data.especialistaId) ||
          ESPECIALISTAS[0];
        citas.push({
          id: doc.id,
          ...data,
          especialistaNombre: docInfo.nombre,
          colorHex: docInfo.color,
        });
      });

      citas.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
      setCitasDelDia(citas);
    } catch (error) {
      console.error("Error al buscar citas:", error);
    } finally {
      setCargando(false);
    }
  };

  // Se ejecuta cada vez que cambias de día en el calendario superior
  useEffect(() => {
    buscarCitas();
  }, [fechaSeleccionada]);

  const toggleDoctor = (id: string) => {
    setDoctoresVisibles((prev) =>
      prev.includes(id) ? prev.filter((docId) => docId !== id) : [...prev, id],
    );
  };

  const citasFiltradas = citasDelDia.filter((cita) =>
    doctoresVisibles.includes(cita.especialistaId),
  );

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "confirmada":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "completada":
        return <UserCheck className="w-4 h-4 text-gray-500" />;
      case "cancelada":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 flex flex-col h-[90vh]">
      {/* HEADER PRINCIPAL */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-[#2651A3]">Agenda Dinámica</h1>
          <p className="text-gray-500 mt-1">
            Gestión visual de turnos y sillones
          </p>
        </div>
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="text-[#2651A3] border-[#2651A3] hover:bg-blue-50"
          >
            Hoy
          </Button>
          <Button
            className="bg-[#39ACB8] hover:bg-[#2c8892] shadow-md"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" /> Agendar Turno
          </Button>
        </div>
      </div>

      {/* COMPONENTE DE CALENDARIO PREMIUM (Tira Horizontal) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 shrink-0">
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-xl font-bold text-gray-800 capitalize">
            {format(semanaActual, "MMMM 'de' yyyy", { locale: es })}
          </h2>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={semanaAnterior}
              className="hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={semanaSiguiente}
              className="hover:bg-gray-100"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 md:gap-4">
          {diasDeLaSemana.map((dia, index) => {
            const isSelected =
              format(dia, "yyyy-MM-dd") ===
              format(fechaSeleccionada, "yyyy-MM-dd");
            const isToday =
              format(dia, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

            return (
              <div
                key={index}
                onClick={() => setFechaSeleccionada(dia)}
                className={`flex flex-col items-center justify-center p-3 md:p-4 rounded-xl cursor-pointer transition-all duration-200 border-2
                  ${
                    isSelected
                      ? "bg-[#2651A3] border-[#2651A3] text-white shadow-md transform scale-105"
                      : "bg-gray-50 border-transparent text-gray-600 hover:bg-blue-50 hover:border-blue-100"
                  }
                `}
              >
                <span
                  className={`text-xs md:text-sm font-semibold uppercase tracking-wider ${isSelected ? "text-blue-100" : "text-gray-400"}`}
                >
                  {format(dia, "EEE", { locale: es })}
                </span>
                <span
                  className={`text-2xl md:text-3xl font-bold mt-1 ${isSelected ? "text-white" : "text-gray-800"}`}
                >
                  {format(dia, "d")}
                </span>
                {/* Punto indicador para el día de HOY */}
                {isToday && (
                  <div
                    className={`w-1.5 h-1.5 rounded-full mt-2 ${isSelected ? "bg-white" : "bg-[#39ACB8]"}`}
                  ></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* COLUMNA FILTROS (Izquierda - Ocupa menos espacio ahora) */}
        <div className="md:col-span-3 flex flex-col gap-4 min-h-0">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex-1">
            <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider flex items-center gap-2">
              <Stethoscope className="w-4 h-4" /> Especialistas
            </h3>
            <div className="space-y-3">
              {ESPECIALISTAS.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => toggleDoctor(doc.id)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors border ${doctoresVisibles.includes(doc.id) ? "bg-gray-50 border-gray-200 shadow-sm" : "border-transparent opacity-50 hover:bg-gray-50"}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${doc.color} shadow-sm`}
                    ></div>
                    <span className="font-semibold text-gray-700">
                      {doc.nombre}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMNA TIMELINE (Derecha - Mucho más amplia) */}
        <div className="md:col-span-9 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col min-h-0 overflow-hidden">
          <div className="p-5 border-b bg-[#F5F8FA]">
            <h2 className="text-xl font-bold text-[#2651A3] capitalize">
              {format(fechaSeleccionada, "EEEE, d 'de' MMMM", { locale: es })}
            </h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              {citasFiltradas.length} turnos programados
            </p>
          </div>

          <ScrollArea className="flex-1 p-6 bg-gray-50/30">
            {cargando ? (
              <p className="text-gray-500 text-center mt-10 font-medium animate-pulse">
                Sincronizando agenda...
              </p>
            ) : citasFiltradas.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-gray-400 mt-24 space-y-4">
                <div className="bg-gray-100 p-4 rounded-full">
                  <Clock className="w-12 h-12 text-gray-300" />
                </div>
                <p className="font-medium text-gray-500">
                  La agenda está despejada para los especialistas seleccionados.
                </p>
              </div>
            ) : (
              <div className="relative border-l-2 border-gray-200 ml-6 space-y-8 py-4">
                {citasFiltradas.map((cita) => {
                  const docInfo =
                    ESPECIALISTAS.find((e) => e.id === cita.especialistaId) ||
                    ESPECIALISTAS[0];

                  return (
                    <div key={cita.id} className="relative pl-8 group">
                      {/* Punto en el Timeline */}
                      <div
                        className={`absolute -left-[11px] top-4 w-5 h-5 rounded-full border-4 border-white ${docInfo.color} shadow-sm transition-transform group-hover:scale-110`}
                      ></div>

                      {/* Tarjeta de la Cita */}
                      <div
                        className={`bg-white border-l-4 ${docInfo.borde} rounded-2xl p-5 shadow-sm hover:shadow-md transition-all border border-gray-100`}
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span
                                className={`text-base font-bold bg-blue-50 px-3 py-1 rounded-md ${docInfo.text}`}
                              >
                                {cita.horaInicio} - {cita.horaFin}
                              </span>
                              <div className="flex items-center gap-1.5 bg-gray-50 border px-3 py-1 rounded-full text-xs font-medium text-gray-600">
                                {getEstadoIcon(cita.estado)}
                                <span className="capitalize">
                                  {cita.estado}
                                </span>
                              </div>
                            </div>
                            <h4 className="text-xl font-bold text-gray-800">
                              {cita.pacienteNombre}
                            </h4>
                            <p className="text-gray-600 text-sm mt-2 flex items-center gap-2 bg-gray-50 w-fit px-3 py-1.5 rounded-lg border border-gray-100">
                              <Stethoscope className="w-4 h-4 text-gray-400" />{" "}
                              {cita.motivo}
                            </p>
                          </div>

                          <div className="flex flex-col items-end justify-between h-full space-y-4">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-1 rounded">
                              {docInfo.nombre}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-[#39ACB8] border-[#39ACB8] hover:bg-[#39ACB8] hover:text-white transition-colors"
                            >
                              <Phone className="w-4 h-4 mr-2" /> Contactar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
      <ModalNuevaCita 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        fechaPreseleccionada={fechaSeleccionada}
        onCitaCreada={buscarCitas} // Recarga la agenda
      />
    </div>
  );
}
