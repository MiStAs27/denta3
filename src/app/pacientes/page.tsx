"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore"; // Añadimos doc y deleteDoc
import { db } from "@/lib/firebase";
import { Paciente } from "@/types/paciente";

import ModalDetallePaciente from "@/components/pacientes/ModalDetallePaciente";
import ModalNuevoPaciente from "@/components/pacientes/ModalNuevoPaciente";
import ModalEditarPaciente from "@/components/pacientes/ModalEditarPaciente"; // Añadimos el modal de editar

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Pencil, Trash2, Plus } from "lucide-react";


export default function PacientesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para manejar cuál paciente está seleccionado y qué modal abrir
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(
    null,
  );
  
  const [isDetalleOpen, setIsDetalleOpen] = useState(false);
  const [isNuevoOpen, setIsNuevoOpen] = useState(false);
  const [isEditarOpen, setIsEditarOpen] = useState(false); // Estado para abrir modal de editar

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarPacientes = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "pacientes"));
      const pacientesBD: Paciente[] = [];
      querySnapshot.forEach((doc) => {
        pacientesBD.push({ id: doc.id, ...doc.data() } as Paciente);
      });
      setPacientes(pacientesBD);
    } catch (error) {
      console.error("Error al cargar pacientes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPacientes();
  }, []);

  const pacientesFiltrados = pacientes.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.ci.includes(searchTerm),
  );

  // Funciones de acción
  const abrirDetalle = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    setIsDetalleOpen(true);
  };

  const abrirEditar = (e: React.MouseEvent, paciente: Paciente) => {
    e.stopPropagation(); // Evita que se abra el detalle al mismo tiempo
    setSelectedPaciente(paciente);
    setIsEditarOpen(true);
  };

  const eliminarPaciente = async (
    e: React.MouseEvent,
    id: string,
    nombre: string,
  ) => {
    e.stopPropagation(); // Evita que se abra el detalle

    // Mostramos una alerta de confirmación nativa del navegador
    if (
      window.confirm(
        `¿Estás completamente seguro de que deseas eliminar a ${nombre}? Esta acción no se puede deshacer.`,
      )
    ) {
      try {
        await deleteDoc(doc(db, "pacientes", id)); // Eliminación en Firebase
        cargarPacientes(); // Recargamos la tabla
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Ocurrió un error al intentar eliminar el paciente.");
      }
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#2651A3]">
          Gestión de Pacientes
        </h1>
        <Button
          className="bg-[#39ACB8] hover:bg-[#2c8892]"
          onClick={() => setIsNuevoOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" /> Nuevo Paciente
        </Button>
      </div>

      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por nombre o CI..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-[#F5F8FA]">
            <TableRow>
              <TableHead className="font-semibold text-gray-600">
                Nombre del Paciente
              </TableHead>
              <TableHead className="font-semibold text-gray-600">CI</TableHead>
              <TableHead className="font-semibold text-gray-600">
                Estado Financiero
              </TableHead>
              <TableHead className="text-right font-semibold text-gray-600">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : pacientesFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  No hay pacientes aún.
                </TableCell>
              </TableRow>
            ) : (
              pacientesFiltrados.map((paciente) => (
                <TableRow
                  key={paciente.id}
                  onClick={() => router.push(`/pacientes/${paciente.id}`)}
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <TableCell className="font-medium text-[#2651A3]">
                    {paciente.nombre}
                  </TableCell>
                  <TableCell>{paciente.ci}</TableCell>
                  <TableCell>
                    {paciente.saldoPendiente > 0 ? (
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold uppercase">
                        Pendiente
                      </span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold uppercase">
                        Pagado
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {/* Botón Editar */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => abrirEditar(e, paciente)}
                    >
                      <Pencil className="h-4 w-4 text-blue-500 hover:text-blue-700" />
                    </Button>

                    {/* Botón Eliminar */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) =>
                        eliminarPaciente(e, paciente.id!, paciente.nombre)
                      }
                    >
                      <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- Renderizado de los Modales (Ventanas Flotantes) --- */}

      <ModalDetallePaciente
        paciente={selectedPaciente}
        isOpen={isDetalleOpen}
        onClose={() => setIsDetalleOpen(false)}
      />

      <ModalNuevoPaciente
        isOpen={isNuevoOpen}
        onClose={() => setIsNuevoOpen(false)}
        onPacienteCreado={cargarPacientes}
      />

      <ModalEditarPaciente
        paciente={selectedPaciente}
        isOpen={isEditarOpen}
        onClose={() => setIsEditarOpen(false)}
        onPacienteActualizado={cargarPacientes}
      />
    </div>
  );
}
