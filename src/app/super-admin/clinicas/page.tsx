"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Building2, Search, Power, PowerOff, Loader2, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function ClinicasPage() {
  const [clinicas, setClinicas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Estados para el Modal de Edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [clinicaEditando, setClinicaEditando] = useState<any>(null);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  const cargarClinicas = async () => {
    setCargando(true);
    try {
      const q = query(collection(db, "usuarios"), where("rol", "==", "TENANT_ADMIN"));
      const querySnapshot = await getDocs(q);
      const lista: any[] = [];
      querySnapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });
      setClinicas(lista);
    } catch (error) {
      console.error("Error al cargar clínicas:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarClinicas();
  }, []);

  const toggleEstadoClinica = async (id: string, estadoActual: string) => {
    const nuevoEstado = estadoActual === "Suspendido" ? "Activo" : "Suspendido";
    const accion = nuevoEstado === "Suspendido" ? "suspender" : "activar";

    if (!window.confirm(`¿Estás seguro de que deseas ${accion} esta clínica?`)) return;

    try {
      await updateDoc(doc(db, "usuarios", id), {
        estado: nuevoEstado
      });
      toast({ title: `Clínica ${nuevoEstado.toLowerCase()} correctamente` });
      cargarClinicas();
    } catch (error) {
      console.error("Error actualizando estado:", error);
      toast({ title: "Error al actualizar estado", variant: "destructive" });
    }
  };

  // --- FUNCIONES DE EDICIÓN ---
  const abrirModalEditar = (clinica: any) => {
    setClinicaEditando({
      id: clinica.id,
      nombre: clinica.nombre,
      nombreClinica: clinica.nombreClinica || "",
      email: clinica.email, // El email es solo lectura por seguridad
    });
    setIsEditModalOpen(true);
  };

  const guardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicaEditando) return;

    setGuardandoEdicion(true);
    try {
      await updateDoc(doc(db, "usuarios", clinicaEditando.id), {
        nombre: clinicaEditando.nombre,
        nombreClinica: clinicaEditando.nombreClinica,
      });
      toast({ title: "Datos de la clínica actualizados" });
      setIsEditModalOpen(false);
      cargarClinicas(); // Recargar la tabla
    } catch (error) {
      console.error("Error al guardar edición:", error);
      toast({ title: "Error al actualizar", variant: "destructive" });
    } finally {
      setGuardandoEdicion(false);
    }
  };

  const clinicasFiltradas = clinicas.filter(c => 
    c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.nombreClinica?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2651A3] flex items-center gap-2">
            <Building2 className="w-8 h-8 text-[#39ACB8]" />
            Gestión de Clínicas
          </h1>
          <p className="text-gray-500 mt-1">Administra los consultorios suscritos a tu plataforma SaaS.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        
        <div className="flex items-center gap-2 mb-6">
          <Search className="w-5 h-5 text-gray-400" />
          <Input 
            placeholder="Buscar por nombre, email o clínica..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Clínica / Dueño</TableHead>
                <TableHead>Email de Acceso</TableHead>
                <TableHead>Fecha de Registro</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cargando ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Cargando consultorios...
                  </TableCell>
                </TableRow>
              ) : clinicasFiltradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    No se encontraron clínicas.
                  </TableCell>
                </TableRow>
              ) : (
                clinicasFiltradas.map((clinica) => (
                  <TableRow key={clinica.id}>
                    <TableCell>
                      <div className="font-bold text-[#2651A3]">
                        {clinica.nombreClinica || "Consultorio sin nombre"}
                      </div>
                      <div className="text-xs text-slate-500">Dr(a): {clinica.nombre}</div>
                    </TableCell>
                    
                    <TableCell className="font-mono text-xs text-gray-600">
                      {clinica.email}
                    </TableCell>
                    
                    <TableCell className="text-sm text-slate-600">
                      {clinica.fechaCreacion 
                        ? new Date(clinica.fechaCreacion).toLocaleDateString() 
                        : "N/A"}
                    </TableCell>
                    
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${clinica.estado === 'Suspendido' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {clinica.estado || "Activo"}
                      </span>
                    </TableCell>
                    
                    <TableCell className="text-right space-x-2">
                      {/* BOTÓN DE EDITAR */}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => abrirModalEditar(clinica)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        title="Editar Clínica"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>

                      {/* BOTÓN DE SUSPENDER/ACTIVAR */}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleEstadoClinica(clinica.id, clinica.estado)}
                        className={clinica.estado === 'Suspendido' 
                          ? 'text-emerald-600 border-emerald-200 hover:bg-emerald-50' 
                          : 'text-red-600 border-red-200 hover:bg-red-50'}
                      >
                        {clinica.estado === 'Suspendido' ? (
                          <><Power className="w-4 h-4 mr-1" /> Reactivar</>
                        ) : (
                          <><PowerOff className="w-4 h-4 mr-1" /> Suspender</>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

      </div>

      {/* --- MODAL PARA EDITAR CLÍNICA --- */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#2651A3]">
              Editar Clínica
            </DialogTitle>
          </DialogHeader>

          {clinicaEditando && (
            <form onSubmit={guardarEdicion} className="space-y-4 mt-4">
              
              <div className="space-y-1">
                <Label>Nombre del Dueño / Doctor(a)</Label>
                <Input 
                  value={clinicaEditando.nombre} 
                  onChange={(e) => setClinicaEditando({...clinicaEditando, nombre: e.target.value.toUpperCase()})}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label>Nombre de la Clínica</Label>
                <Input 
                  value={clinicaEditando.nombreClinica} 
                  onChange={(e) => setClinicaEditando({...clinicaEditando, nombreClinica: e.target.value})}
                  placeholder="Ej. Clínica Dental Sonrisas"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label>Email (Solo lectura)</Label>
                <Input 
                  value={clinicaEditando.email} 
                  disabled 
                  className="bg-gray-100 text-gray-500 font-mono"
                  title="El correo de acceso no se puede modificar desde aquí por seguridad."
                />
              </div>

              <DialogFooter className="pt-4 mt-2 border-t">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-[#39ACB8] hover:bg-[#2c8892]" disabled={guardandoEdicion}>
                  {guardandoEdicion ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}