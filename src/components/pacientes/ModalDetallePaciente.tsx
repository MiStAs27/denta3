"use client";

import Link from 'next/link';
import { useRouter } from "next/navigation";
import { Paciente } from "@/types/paciente";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { FileText, Stethoscope, Wallet } from "lucide-react";

interface ModalProps {
  paciente: Paciente | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalDetallePaciente({ paciente, isOpen, onClose }: ModalProps) {
  const router = useRouter();

  if (!paciente) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#2651A3]">
            Perfil del Paciente
          </DialogTitle>
        </DialogHeader>

        {/* Área scrolleable para los datos */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Sección: Datos Personales */}
            <section>
              <h3 className="text-lg font-semibold text-[#39ACB8] mb-2">Datos Personales</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <p><strong>Nombre:</strong> {paciente.nombre}</p>
                <p><strong>CI:</strong> {paciente.ci}</p>
                <p><strong>Celular:</strong> {paciente.celular}</p>
                <p><strong>Edad:</strong> {paciente.edad} años</p>
                <p><strong>Fecha de Nac.:</strong> {paciente.fechaNacimiento}</p>
                <p><strong>Domicilio:</strong> {paciente.domicilio}</p>
                <p><strong>Lugar de Trabajo:</strong> {paciente.lugarTrabajo}</p>
                <p><strong>Fecha de Registro:</strong> {paciente.fechaCreacion}</p>
              </div>
            </section>

            {/* Sección: Contacto de Emergencia */}
            <section>
              <h3 className="text-lg font-semibold text-[#39ACB8] mb-2">Contacto de Emergencia</h3>
              <div className="grid grid-cols-2 gap-4 text-sm bg-[#F5F8FA] p-3 rounded-md">
                <p><strong>Nombre:</strong> {paciente.contactoEmergencia.nombre}</p>
                <p><strong>Parentesco:</strong> {paciente.contactoEmergencia.parentesco}</p>
                <p><strong>Celular:</strong> {paciente.contactoEmergencia.celular}</p>
              </div>
            </section>

            {/* Sección: Antecedentes */}
            <section>
              <h3 className="text-lg font-semibold text-[#39ACB8] mb-2">Antecedentes Patológicos</h3>
              <div className="space-y-2 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-100">
                <p><strong>Alergias:</strong> {paciente.antecedentes.alergias || "Ninguna"}</p>
                <p><strong>Embarazo:</strong> {paciente.antecedentes.embarazo ? "Sí" : "No"}</p>
                <p><strong>Observaciones:</strong> {paciente.antecedentes.observaciones || "Sin observaciones adicionales."}</p>
              </div>
            </section>
          </div>
        </ScrollArea>

        {/* Botones de Acción (El Puente) */}
        <div className="flex justify-between pt-4 border-t mt-auto">
          <Button variant="outline" onClick={() => alert("Generando PDF...")}>
            <FileText className="w-4 h-4 mr-2" /> Exportar Ficha
          </Button>
          
          <div className="space-x-2">
            <Button 
              className="bg-[#2651A3] hover:bg-[#1a3a75]"
              onClick={() => {
                onClose();
                router.push(`/historia-clinica/${paciente.id}`); // Redirige a M06
              }}
            >
              <Stethoscope className="w-4 h-4 mr-2" /> Ver Historial
            </Button>
            
            <Button 
              className="bg-[#39ACB8] hover:bg-[#2c8892]"
              onClick={() => {
                onClose();
                router.push(`/cobros/${paciente.id}`); // Redirige a M07
              }}
            >
              <Wallet className="w-4 h-4 mr-2" /> Ver Cuenta
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}