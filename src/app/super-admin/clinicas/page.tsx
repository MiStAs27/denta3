"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Building2, Search, Power, PowerOff, Loader2, Pencil, Plus, Trash2, ShieldAlert } from "lucide-react";
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
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [filtroPlan, setFiltroPlan] = useState("Todos");
  const { toast } = useToast();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clinicaEditando, setClinicaEditando] = useState<any>(null);
  const [clinicaASuspender, setClinicaASuspender] = useState<any>(null);
  const [clinicaAEliminar, setClinicaAEliminar] = useState<any>(null);
  const [motivoSuspension, setMotivoSuspension] = useState("");
  const [nombreConfirmacion, setNombreConfirmacion] = useState("");
  const [nuevaClinica, setNuevaClinica] = useState({
    nombre: "",
    email: "",
    nombreClinica: "",
    plan: "Mensual",
    pais: "Bolivia",
    facturacion: "",
  });
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [guardandoClinica, setGuardandoClinica] = useState(false);
  const [guardandoSuspension, setGuardandoSuspension] = useState(false);
  const [eliminandoClinica, setEliminandoClinica] = useState(false);

  const cargarClinicas = async () => {
    setCargando(true);
    try {
      const q = query(collection(db, "usuarios"), where("rol", "==", "TENANT_ADMIN"));
      const querySnapshot = await getDocs(q);
      const lista: any[] = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        lista.push({
          id: docSnapshot.id,
          ...data,
          estado: data.estado || "Activo",
          plan: data.plan || "Sin plan",
          sucursales: data.sucursales || 0,
          usuariosTotales: data.usuariosTotales || 0,
          espacioUsado: data.espacioUsado || "0 MB",
        });
      });
      lista.sort((a, b) => (b.fechaCreacion || "").localeCompare(a.fechaCreacion || ""));
      setClinicas(lista);
    } catch (error) {
      console.error("Error al cargar clínicas:", error);
      toast({ title: "No se pudo cargar la lista de clínicas", variant: "destructive" });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarClinicas();
  }, []);

  const planesUnicos = Array.from(
    new Set(clinicas.map((clinica) => String(clinica.plan || "Sin plan")).filter(Boolean))
  );

  const abrirModalCrear = () => {
    setNuevaClinica({
      nombre: "",
      email: "",
      nombreClinica: "",
      plan: "Mensual",
      pais: "Bolivia",
      facturacion: "",
    });
    setIsCreateModalOpen(true);
  };

  const crearClinica = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nuevaClinica.nombre.trim() || !nuevaClinica.email.trim() || !nuevaClinica.nombreClinica.trim()) {
      toast({ title: "Complete los campos obligatorios", variant: "destructive" });
      return;
    }

    setGuardandoClinica(true);

    try {
      const emailNormalizado = nuevaClinica.email.toLowerCase().trim();
      const queryDuplicado = query(
        collection(db, "usuarios"),
        where("rol", "==", "TENANT_ADMIN"),
        where("email", "==", emailNormalizado)
      );
      const duplicado = await getDocs(queryDuplicado);

      if (!duplicado.empty) {
        toast({ title: "Ya existe un consultorio con este email de responsable", variant: "destructive" });
        return;
      }

      const password = `DentaSync!${Math.random().toString(36).slice(-8)}${Math.floor(Math.random() * 90 + 10)}`;
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailNormalizado,
          password,
          nombreAdmin: nuevaClinica.nombre.trim().toUpperCase(),
          nombreClinica: nuevaClinica.nombreClinica.trim(),
          rol: "TENANT_ADMIN",
        }),
      });

      const resultado = await response.json();
      if (!response.ok) {
        throw new Error(resultado.error || "No se pudo crear el consultorio");
      }

      await updateDoc(doc(db, "usuarios", resultado.uid), {
        plan: nuevaClinica.plan,
        pais: nuevaClinica.pais,
        datosFacturacion: nuevaClinica.facturacion.trim(),
        estado: "Activo",
        fechaCreacion: new Date().toISOString(),
        tenantId: resultado.uid,
      });

      toast({
        title: "Consultorio creado correctamente",
        description: "El tenant quedó registrado y listo para usar.",
      });
      setIsCreateModalOpen(false);
      await cargarClinicas();
    } catch (error: any) {
      console.error("Error al crear consultorio:", error);
      toast({ title: error.message || "Error al crear consultorio", variant: "destructive" });
    } finally {
      setGuardandoClinica(false);
    }
  };

  const abrirModalSuspender = (clinica: any) => {
    setClinicaASuspender(clinica);
    setMotivoSuspension("");
    setIsSuspendModalOpen(true);
  };

  const confirmarSuspension = async () => {
    if (!clinicaASuspender) return;

    if (clinicaASuspender.estado === "Suspendido") {
      toast({ title: "El consultorio ya se encuentra suspendido", variant: "destructive" });
      return;
    }

    if (!motivoSuspension.trim()) {
      toast({ title: "Debe seleccionar un motivo de suspensión", variant: "destructive" });
      return;
    }

    setGuardandoSuspension(true);

    try {
      await updateDoc(doc(db, "usuarios", clinicaASuspender.id), {
        estado: "Suspendido",
        motivoSuspension: motivoSuspension.trim(),
        suspendidoEn: new Date().toISOString(),
      });

      toast({
        title: "Consultorio suspendido",
        description: "El acceso del tenant quedó bloqueado y el listado se actualizó.",
      });
      setIsSuspendModalOpen(false);
      setClinicaASuspender(null);
      await cargarClinicas();
    } catch (error) {
      console.error("Error al suspender consultorio:", error);
      toast({ title: "Error al suspender consultorio", variant: "destructive" });
    } finally {
      setGuardandoSuspension(false);
    }
  };

  const toggleEstadoClinica = async (clinica: any) => {
    const estadoActual = clinica.estado || "Activo";

    if (estadoActual === "Suspendido") {
      try {
        await updateDoc(doc(db, "usuarios", clinica.id), {
          estado: "Activo",
          motivoSuspension: "",
        });
        toast({ title: "Consultorio activado correctamente" });
        await cargarClinicas();
      } catch (error) {
        console.error("Error al reactivar consultorio:", error);
        toast({ title: "Error al reactivar consultorio", variant: "destructive" });
      }
      return;
    }

    abrirModalSuspender(clinica);
  };

  const abrirModalEliminar = (clinica: any) => {
    setClinicaAEliminar(clinica);
    setNombreConfirmacion("");
    setIsDeleteModalOpen(true);
  };

  const eliminarClinica = async () => {
    if (!clinicaAEliminar) return;

    if (nombreConfirmacion.trim() !== (clinicaAEliminar.nombreClinica || "").trim()) {
      toast({ title: "El nombre no coincide. Operación cancelada.", variant: "destructive" });
      return;
    }

    setEliminandoClinica(true);

    try {
      await updateDoc(doc(db, "usuarios", clinicaAEliminar.id), {
        estado: "Eliminado",
        eliminadoEn: new Date().toISOString(),
      });
      toast({ title: "Consultorio eliminado del listado activo" });
      setIsDeleteModalOpen(false);
      setClinicaAEliminar(null);
      await cargarClinicas();
    } catch (error) {
      console.error("Error al eliminar consultorio:", error);
      toast({ title: "Error al eliminar consultorio", variant: "destructive" });
    } finally {
      setEliminandoClinica(false);
    }
  };

  // --- FUNCIONES DE EDICIÓN ---
  const abrirModalEditar = (clinica: any) => {
    setClinicaEditando({
      id: clinica.id,
      nombre: clinica.nombre,
      nombreClinica: clinica.nombreClinica || "",
      email: clinica.email,
      plan: clinica.plan || "Mensual",
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
        plan: clinicaEditando.plan || "Mensual",
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

  const clinicasFiltradas = clinicas.filter((clinica) => {
    const texto = searchTerm.toLowerCase();
    const coincideBusqueda =
      clinica.nombre?.toLowerCase().includes(texto) ||
      clinica.email?.toLowerCase().includes(texto) ||
      clinica.nombreClinica?.toLowerCase().includes(texto);

    const estado = String(clinica.estado || "Activo").toLowerCase();
    const plan = String(clinica.plan || "Sin plan").toLowerCase();

    const coincideEstado = filtroEstado === "Todos" || estado === filtroEstado.toLowerCase();
    const coincidePlan = filtroPlan === "Todos" || plan === filtroPlan.toLowerCase();

    return coincideBusqueda && coincideEstado && coincidePlan;
  });

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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-5 h-5 text-gray-400" />
            <Input 
              placeholder="Buscar por nombre, email o clínica..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="border rounded-md bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#39ACB8]"
            >
              <option value="Todos">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Suspendido">Suspendido</option>
              <option value="Eliminado">Eliminado</option>
            </select>

            <select
              value={filtroPlan}
              onChange={(e) => setFiltroPlan(e.target.value)}
              className="border rounded-md bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#39ACB8]"
            >
              <option value="Todos">Todos los planes</option>
              {planesUnicos.map((plan) => (
                <option key={plan} value={plan}>{plan}</option>
              ))}
            </select>

            <Button onClick={abrirModalCrear} className="bg-[#2651A3] hover:bg-[#1c3d7a]">
              <Plus className="w-4 h-4 mr-2" /> Crear consultorio
            </Button>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Clínica / Dueño</TableHead>
                <TableHead>Email de Acceso</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Fecha de Registro</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Sucursales</TableHead>
                <TableHead>Usuarios</TableHead>
                <TableHead>Espacio</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cargando ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Cargando consultorios...
                  </TableCell>
                </TableRow>
              ) : clinicasFiltradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-slate-500">
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
                      {clinica.plan || "Sin plan"}
                    </TableCell>
                    
                    <TableCell className="text-sm text-slate-600">
                      {clinica.fechaCreacion 
                        ? new Date(clinica.fechaCreacion).toLocaleDateString() 
                        : "N/A"}
                    </TableCell>
                    
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        clinica.estado === 'Suspendido'
                          ? 'bg-red-100 text-red-700'
                          : clinica.estado === 'Pendiente'
                            ? 'bg-amber-100 text-amber-700'
                            : clinica.estado === 'Eliminado'
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {clinica.estado || "Activo"}
                      </span>
                    </TableCell>

                    <TableCell className="text-sm text-slate-600">{clinica.sucursales || 0}</TableCell>
                    <TableCell className="text-sm text-slate-600">{clinica.usuariosTotales || 0}</TableCell>
                    <TableCell className="text-sm text-slate-600">{clinica.espacioUsado || "0 MB"}</TableCell>
                    
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
                        onClick={() => toggleEstadoClinica(clinica)}
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

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => abrirModalEliminar(clinica)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        title="Eliminar consultorio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

      </div>

      {/* --- MODAL PARA CREAR CLÍNICA --- */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#2651A3]">Crear consultorio</DialogTitle>
          </DialogHeader>

          <form onSubmit={crearClinica} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Nombre del responsable</Label>
                <Input
                  value={nuevaClinica.nombre}
                  onChange={(e) => setNuevaClinica({ ...nuevaClinica, nombre: e.target.value })}
                  placeholder="Dr. Juan Pérez"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label>Email de acceso</Label>
                <Input
                  type="email"
                  value={nuevaClinica.email}
                  onChange={(e) => setNuevaClinica({ ...nuevaClinica, email: e.target.value })}
                  placeholder="doctor@clinica.com"
                  required
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <Label>Nombre del consultorio</Label>
                <Input
                  value={nuevaClinica.nombreClinica}
                  onChange={(e) => setNuevaClinica({ ...nuevaClinica, nombreClinica: e.target.value })}
                  placeholder="Clínica Dental Sonrisas"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label>Plan</Label>
                <select
                  value={nuevaClinica.plan}
                  onChange={(e) => setNuevaClinica({ ...nuevaClinica, plan: e.target.value })}
                  className="w-full border rounded-md bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#39ACB8]"
                >
                  <option value="Mensual">Mensual</option>
                  <option value="Trimestral">Trimestral</option>
                  <option value="Semestral">Semestral</option>
                  <option value="Anual">Anual</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label>País</Label>
                <Input
                  value={nuevaClinica.pais}
                  onChange={(e) => setNuevaClinica({ ...nuevaClinica, pais: e.target.value })}
                  placeholder="Bolivia"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <Label>Datos de facturación</Label>
                <Input
                  value={nuevaClinica.facturacion}
                  onChange={(e) => setNuevaClinica({ ...nuevaClinica, facturacion: e.target.value })}
                  placeholder="NIT, RUC, dirección de facturación"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-[#2651A3] hover:bg-[#1c3d7a]" disabled={guardandoClinica}>
                {guardandoClinica ? "Creando..." : "Guardar consultorio"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
                <Label>Plan de suscripción</Label>
                <select
                  value={clinicaEditando.plan || "Mensual"}
                  onChange={(e) => setClinicaEditando({ ...clinicaEditando, plan: e.target.value })}
                  className="w-full border rounded-md bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#39ACB8]"
                >
                  <option value="Mensual">Mensual</option>
                  <option value="Trimestral">Trimestral</option>
                  <option value="Semestral">Semestral</option>
                  <option value="Anual">Anual</option>
                </select>
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

      <Dialog open={isSuspendModalOpen} onOpenChange={setIsSuspendModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#2651A3]">Suspender consultorio</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <p className="text-sm text-slate-600">
              Seleccione un motivo para bloquear el acceso del tenant y registrar la acción en bitácora.
            </p>
            <div className="space-y-1">
              <Label>Motivo de suspensión</Label>
              <select
                value={motivoSuspension}
                onChange={(e) => setMotivoSuspension(e.target.value)}
                className="w-full border rounded-md bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#39ACB8]"
              >
                <option value="">Seleccione un motivo</option>
                <option value="Pago pendiente">Pago pendiente</option>
                <option value="Incumplimiento contractual">Incumplimiento contractual</option>
                <option value="Solicitud del cliente">Solicitud del cliente</option>
                <option value="Actividad sospechosa">Actividad sospechosa</option>
              </select>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsSuspendModalOpen(false)}>Cancelar</Button>
            <Button onClick={confirmarSuspension} className="bg-red-600 hover:bg-red-700" disabled={guardandoSuspension}>
              {guardandoSuspension ? "Suspending..." : "Confirmar suspensión"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-700 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> Eliminar consultorio
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4 text-sm text-slate-700">
            <p>Esta acción marcará al consultorio como eliminado y lo retirará del listado activo. Los datos se conservarán para auditoría.</p>
            <p className="text-red-600 font-semibold">Escriba exactamente el nombre del consultorio para confirmar.</p>
            <div className="space-y-1">
              <Label>Nombre del consultorio</Label>
              <Input
                value={nombreConfirmacion}
                onChange={(e) => setNombreConfirmacion(e.target.value)}
                placeholder={clinicaAEliminar?.nombreClinica || "Nombre del consultorio"}
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
            <Button onClick={eliminarClinica} className="bg-red-600 hover:bg-red-700" disabled={eliminandoClinica}>
              {eliminandoClinica ? "Eliminando..." : "Eliminar consultorio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}