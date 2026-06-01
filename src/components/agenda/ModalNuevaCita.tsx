"use client";

import { useState, useEffect } from "react";
// 🔥 Agregamos query y where para filtrar
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format } from "date-fns";
import { Paciente } from "@/types/paciente";
import { useAuth } from "@/context/AuthContext"; // 🔥 Importamos el contexto de Auth

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { obtenerConfigMorosos } from "@/lib/cobros-store";
import { useToast } from "@/hooks/use-toast";

const ESPECIALISTAS = [
  { id: "doc_1", nombre: "Dr. Carlos Ruiz" },
  { id: "doc_2", nombre: "Dra. Ana López" },
];

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  fechaPreseleccionada: Date;
  onCitaCreada: () => void;
}

export default function ModalNuevaCita({
  isOpen,
  onClose,
  fechaPreseleccionada,
  onCitaCreada,
}: ModalProps) {
  const { user } = useAuth(); // 🔥 Obtenemos el usuario y su tenantId
  const { toast } = useToast();

  const [cargando, setCargando] = useState(false);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);

  const [pacienteId, setPacienteId] = useState("");
  const [especialistaId, setEspecialistaId] = useState(ESPECIALISTAS[0].id);
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFin, setHoraFin] = useState("09:30");
  const [motivo, setMotivo] = useState("");

  useEffect(() => {
    const cargarPacientes = async () => {
      // 🔥 Si no hay tenantId, no buscamos nada por seguridad
      if (!user?.tenantId) return;

      try {
        // 🔥 Solo traemos pacientes que pertenecen a ESTA clínica
        const q = query(
          collection(db, "pacientes"),
          where("tenantId", "==", user.tenantId),
        );
        const querySnapshot = await getDocs(q);

        const pacientesBD: Paciente[] = [];
        querySnapshot.forEach((doc) => {
          pacientesBD.push({ id: doc.id, ...doc.data() } as Paciente);
        });
        setPacientes(pacientesBD);
      } catch (error) {
        console.error("Error al cargar pacientes:", error);
      }
    };

    // Solo cargamos si el modal se abre y tenemos el tenantId listo
    if (isOpen && user?.tenantId) {
      cargarPacientes();
    }
  }, [isOpen, user?.tenantId]);

  const guardarCita = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pacienteId) {
      alert("Por favor, selecciona un paciente.");
      return;
    }
    if (!user?.tenantId) {
      alert("Error: No tienes una clínica asignada.");
      return;
    }

    setCargando(true);

    try {
      const pacienteSeleccionado = pacientes.find((p) => p.id === pacienteId);

      if (pacienteSeleccionado && (pacienteSeleccionado as any).esMoroso) {
        const config = await obtenerConfigMorosos(user.tenantId);
        if (config.bloquearCitas) {
          toast({
            title: "Cita bloqueada",
            description:
              "Este paciente está marcado como moroso. No se puede agendar.",
            variant: "destructive",
          });
          setCargando(false);
          return;
        }
      }

      const nuevaCita = {
        tenantId: user.tenantId, // 🔥 INYECCIÓN DE LA CLÍNICA
        pacienteId: pacienteId,
        pacienteNombre: pacienteSeleccionado?.nombre || "Paciente Desconocido",
        especialistaId: especialistaId,
        fecha: format(fechaPreseleccionada, "yyyy-MM-dd"),
        horaInicio: horaInicio,
        horaFin: horaFin,
        motivo: motivo,
        estado: "pendiente",
      };

      await addDoc(collection(db, "citas"), nuevaCita);

      setMotivo("");
      setHoraInicio("09:00");
      setHoraFin("09:30");
      onCitaCreada();
      onClose();
    } catch (error) {
      console.error("Error al guardar cita:", error);
      alert("Ocurrió un error al guardar la cita.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* ... (Todo el HTML / JSX del modal se queda exactamente igual) ... */}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#2651A3]">
            Agendar Nuevo Turno
          </DialogTitle>
          <p className="text-sm text-gray-500">
            Para el día:{" "}
            <span className="font-semibold text-gray-700">
              {format(fechaPreseleccionada, "dd/MM/yyyy")}
            </span>
          </p>
        </DialogHeader>

        <form onSubmit={guardarCita} className="space-y-4 mt-4">
          <div className="space-y-1">
            <Label>Paciente *</Label>
            <select
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={pacienteId}
              onChange={(e) => setPacienteId(e.target.value)}
              required
            >
              <option value="" disabled>
                Seleccione un paciente...
              </option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} - CI: {p.ci}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label>Especialista / Sillón *</Label>
            <select
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={especialistaId}
              onChange={(e) => setEspecialistaId(e.target.value)}
              required
            >
              {ESPECIALISTAS.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Hora de Inicio *</Label>
              <Input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Hora de Fin *</Label>
              <Input
                type="time"
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Motivo de la consulta *</Label>
            <Input
              placeholder="Ej. Profilaxis, Consulta inicial..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              required
            />
          </div>

          <DialogFooter className="pt-4 mt-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={cargando}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#39ACB8] hover:bg-[#2c8892]"
              disabled={cargando}
            >
              {cargando ? "Guardando..." : "Confirmar Turno"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
