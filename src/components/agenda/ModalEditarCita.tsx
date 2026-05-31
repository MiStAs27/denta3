"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { doc, updateDoc, addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Cita } from "@/types/cita";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ModalEditarProps {
  isOpen: boolean;
  onClose: () => void;
  cita: (Cita & { id: string }) | null;
  onCitaActualizada: () => void;
}

export default function ModalEditarCita({ isOpen, onClose, cita, onCitaActualizada }: ModalEditarProps) {
  const [cargando, setCargando] = useState(false);
  const { user } = useAuth();
  const [fecha, setFecha] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [motivo, setMotivo] = useState("");
  const [estado, setEstado] = useState("pendiente");

  // Campos exclusivos para cuando se reprograma
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [nuevaHora, setNuevaHora] = useState("");

  useEffect(() => {
    if (cita && isOpen) {
      setFecha(cita.fecha);
      setHoraInicio(cita.horaInicio);
      setHoraFin(cita.horaFin);
      setMotivo(cita.motivo);
      // Inicialización robusta: Si no hay estado o dice "programada", forzamos "pendiente"
      const estadoCrudo = cita.estado ? cita.estado.toLowerCase().trim() : "pendiente";
      setEstado(estadoCrudo === "programada" ? "pendiente" : estadoCrudo);
      setNuevaFecha(""); // Limpiamos campos de reprogramación
      setNuevaHora(cita.horaInicio);
    }
  }, [cita, isOpen]);

  const guardarCambios = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cita) return;
    setCargando(true);

    try {
      const citaRef = doc(db, "citas", cita.id);

      if (estado === "reprogramada") {
        if (!nuevaFecha || !nuevaHora) {
          alert("Debes indicar la nueva fecha y hora para reprogramar.");
          setCargando(false);
          return;
        }

        // 1. Actualizamos la cita antigua
        await updateDoc(citaRef, {
          estado: "reprogramada",
          fechaReprogramada: nuevaFecha 
        });

        // 2. CREAMOS LA NUEVA CITA CON EL SELLO DE LA CLÍNICA
        const nuevaCita = {
          tenantId: user?.tenantId, // <--- ¡AQUÍ ESTÁ LA SOLUCIÓN!
          pacienteId: cita.pacienteId,
          pacienteNombre: cita.pacienteNombre,
          especialistaId: cita.especialistaId,
          fecha: nuevaFecha,
          horaInicio: nuevaHora,
          horaFin: cita.horaFin, 
          motivo: cita.motivo,
          estado: "pendiente" 
        };
        await addDoc(collection(db, "citas"), nuevaCita);

      } else {
        // Actualización normal
        await updateDoc(citaRef, { fecha, horaInicio, horaFin, motivo, estado });
      }

      onCitaActualizada();
      onClose();
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert("Ocurrió un error al guardar los cambios.");
    } finally {
      setCargando(false);
    }
  };

  if (!cita) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#2651A3]">Gestionar Turno</DialogTitle>
          <p className="text-sm text-gray-500">Paciente: <span className="font-semibold text-gray-700">{cita.pacienteNombre}</span></p>
        </DialogHeader>

        <form onSubmit={guardarCambios} className="space-y-4 mt-2">
          
          <div className="space-y-1">
            <Label>Estado del Turno</Label>
            <select 
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring font-semibold"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="reprogramada">Reprogramar</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          {/* SI ELIGE REPROGRAMAR, MOSTRAMOS ESTOS CAMPOS */}
          {estado === "reprogramada" ? (
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 space-y-3">
              <p className="text-xs font-semibold text-purple-700 uppercase">Datos del nuevo turno</p>
              <div className="space-y-1">
                <Label>Mover para el día:</Label>
                <Input type="date" value={nuevaFecha} onChange={(e) => setNuevaFecha(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label>A la hora:</Label>
                <Input type="time" value={nuevaHora} onChange={(e) => setNuevaHora(e.target.value)} required />
              </div>
            </div>
          ) : (
            // SI NO REPROGRAMA, MOSTRAMOS LOS CAMPOS NORMALES
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Hora Inicio</Label>
                  <Input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label>Hora Fin</Label>
                  <Input type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Motivo</Label>
                <Input value={motivo} onChange={(e) => setMotivo(e.target.value)} required />
              </div>
            </>
          )}

          <DialogFooter className="pt-4 mt-2 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={cargando}>Cancelar</Button>
            <Button type="submit" className="bg-[#2651A3] hover:bg-[#1a3a75]" disabled={cargando}>
              {cargando ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}