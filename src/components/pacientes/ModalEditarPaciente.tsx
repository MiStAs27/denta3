"use client";

import { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Paciente } from "@/types/paciente";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ModalProps {
  paciente: Paciente | null;
  isOpen: boolean;
  onClose: () => void;
  onPacienteActualizado: () => void; // Para recargar la tabla
}

export default function ModalEditarPaciente({ paciente, isOpen, onClose, onPacienteActualizado }: ModalProps) {
  const [cargando, setCargando] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: "", ci: "", celular: "", edad: "", fechaNacimiento: "", domicilio: "", lugarTrabajo: "",
    emergenciaNombre: "", emergenciaParentesco: "", emergenciaCelular: "",
    alergias: "", observaciones: ""
  });

  // Cuando se abre el modal y recibe un paciente, llenamos los campos con sus datos
  useEffect(() => {
    if (paciente) {
      setFormData({
        nombre: paciente.nombre,
        ci: paciente.ci,
        celular: paciente.celular.toString(),
        edad: paciente.edad.toString(),
        fechaNacimiento: paciente.fechaNacimiento,
        domicilio: paciente.domicilio,
        lugarTrabajo: paciente.lugarTrabajo,
        emergenciaNombre: paciente.contactoEmergencia.nombre,
        emergenciaParentesco: paciente.contactoEmergencia.parentesco,
        emergenciaCelular: paciente.contactoEmergencia.celular,
        alergias: paciente.antecedentes.alergias,
        observaciones: paciente.antecedentes.observaciones,
      });
    }
  }, [paciente]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const actualizarPaciente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paciente?.id) return;
    
    setCargando(true);

    try {
      // 1. Referencia al documento específico en Firebase usando su ID
      const pacienteRef = doc(db, "pacientes", paciente.id);

      // 2. Preparamos los datos actualizados (manteniendo la estructura)
      const datosActualizados = {
        nombre: formData.nombre,
        ci: formData.ci,
        celular: Number(formData.celular),
        edad: Number(formData.edad),
        fechaNacimiento: formData.fechaNacimiento,
        domicilio: formData.domicilio,
        lugarTrabajo: formData.lugarTrabajo,
        contactoEmergencia: {
          nombre: formData.emergenciaNombre,
          parentesco: formData.emergenciaParentesco,
          celular: Number(formData.emergenciaCelular)
        },
        antecedentes: {
          alergias: formData.alergias,
          observaciones: formData.observaciones,
          embarazo: paciente.antecedentes.embarazo // Mantenemos el estado anterior
        }
      };

      // 3. Actualizamos en Firebase
      await updateDoc(pacienteRef, datosActualizados);

      // 4. Avisamos a la tabla y cerramos
      onPacienteActualizado();
      onClose();
    } catch (error) {
      console.error("Error al actualizar paciente:", error);
      alert("Hubo un error al actualizar los datos.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#2651A3]">
            Editar Paciente: {paciente?.nombre}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={actualizarPaciente} className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6 p-1">
              
              {/* --- Datos Personales --- */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#39ACB8] border-b pb-1">Datos Personales</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Nombre Completo *</Label>
                    <Input name="nombre" value={formData.nombre} onChange={handleChange} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Carnet de Identidad (CI) *</Label>
                    <Input name="ci" value={formData.ci} onChange={handleChange} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Celular *</Label>
                    <Input name="celular" value={formData.celular} onChange={handleChange} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Fecha de Nacimiento</Label>
                    <Input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} />
                  </div>
                  <div className="space-y-1">
                    <Label>Edad</Label>
                    <Input type="number" name="edad" value={formData.edad} onChange={handleChange} />
                  </div>
                  <div className="space-y-1">
                    <Label>Domicilio</Label>
                    <Input name="domicilio" value={formData.domicilio} onChange={handleChange} />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label>Lugar de Trabajo</Label>
                    <Input name="lugarTrabajo" value={formData.lugarTrabajo} onChange={handleChange} />
                  </div>
                </div>
              </div>

              {/* --- Contacto de Emergencia --- */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#39ACB8] border-b pb-1">Contacto de Emergencia</h3>
                <div className="grid grid-cols-2 gap-4 bg-[#F5F8FA] p-3 rounded-md">
                  <div className="col-span-2 space-y-1">
                    <Label>Nombre del Contacto</Label>
                    <Input name="emergenciaNombre" value={formData.emergenciaNombre} onChange={handleChange} />
                  </div>
                  <div className="space-y-1">
                    <Label>Parentesco</Label>
                    <Input name="emergenciaParentesco" value={formData.emergenciaParentesco} onChange={handleChange} />
                  </div>
                  <div className="space-y-1">
                    <Label>Celular de Emergencia</Label>
                    <Input name="emergenciaCelular" value={formData.emergenciaCelular} onChange={handleChange} />
                  </div>
                </div>
              </div>

              {/* --- Antecedentes Básicos --- */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-red-500 border-b pb-1 border-red-200">Triaje Médico</h3>
                <div className="space-y-3 bg-red-50 p-3 rounded-md">
                  <div className="space-y-1">
                    <Label className="text-red-700">Alergias (Separadas por coma)</Label>
                    <Input name="alergias" value={formData.alergias} onChange={handleChange} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-red-700">Observaciones Previas</Label>
                    <Input name="observaciones" value={formData.observaciones} onChange={handleChange} />
                  </div>
                </div>
              </div>

            </div>
          </ScrollArea>

          <DialogFooter className="pt-4 mt-2 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={cargando}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#2651A3] hover:bg-[#1a3a75]" disabled={cargando}>
              {cargando ? "Actualizando..." : "Actualizar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}