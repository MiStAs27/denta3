"use client";

import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { signOut, sendPasswordResetEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  UserPlus,
  Building2,
  UserCircle,
  LogOut,
  Trash2,
  KeyRound,
  Pencil,
  Mail,
  Phone,
  MapPin,
  Eye,
  EyeOff,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

// 🔒 Importamos tu tipo de rol oficial
import { RolUsuario } from "@/types/roles";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [tabActiva, setTabActiva] = useState("perfil");

  // ==========================================
  // ESTADOS: CAMBIO DE CONTRASEÑA
  // ==========================================
  const [mostradorCambioContrasena, setMostradorCambioContrasena] = useState(false);
  const [contrasenaActual, setContrasenaActual] = useState("");
  const [contrasenaNew, setContrasenaNew] = useState("");
  const [contrasenaNewConfirm, setContrasenaNewConfirm] = useState("");
  const [cambioContrasenaEnProgreso, setCambioContrasenaEnProgreso] = useState(false);
  const [mostrarContrasenarNew, setMostrarContrasenarNew] = useState(false);
  const [mostrarContrasenarConfirm, setMostrarContrasenarConfirm] = useState(false);

  // ==========================================
  // ESTADOS: GESTIÓN DE PERSONAL
  // ==========================================
  const [personal, setPersonal] = useState<any[]>([]);
  const [cargandoPersonal, setCargandoPersonal] = useState(true);
  const [guardandoPersonal, setGuardandoPersonal] = useState(false);

  const [usuarioEditandoId, setUsuarioEditandoId] = useState<string | null>(
    null,
  );
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [correoGenerado, setCorreoGenerado] = useState("");

  // 🔥 CORRECCIÓN: Usamos tu tipo RolUsuario
  const [rolSeleccionado, setRolSeleccionado] =
    useState<RolUsuario>("ESPECIALISTA");

  // ==========================================
  // ESTADOS: DETALLES DEL CONSULTORIO
  // ==========================================
  const [datosClinica, setDatosClinica] = useState({
    nombreClinica: "",
    direccion: "",
    telefono: "",
    ciudad: "",
  });
  const [cargandoClinica, setCargandoClinica] = useState(true);
  const [guardandoClinica, setGuardandoClinica] = useState(false);

  // Generador de correo automático
  useEffect(() => {
    if (usuarioEditandoId) return;

    if (nombreCompleto.trim() === "") {
      setCorreoGenerado("");
      return;
    }

    const partes = nombreCompleto.trim().toLowerCase().split(/\s+/);
    let email = "";

    if (partes.length >= 3) {
      email = `${partes[0].charAt(0)}${partes[partes.length - 2]}${partes[partes.length - 1].charAt(0)}@dentasync.com`;
    } else if (partes.length === 2) {
      email = `${partes[0].charAt(0)}${partes[1]}@dentasync.com`;
    } else {
      email = `${partes[0]}@dentasync.com`;
    }

    email = email.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    setCorreoGenerado(email);
  }, [nombreCompleto, usuarioEditandoId]);

  // ==========================================
  // FUNCIONES: CARGA DE DATOS SAAS
  // ==========================================

  const cargarPersonal = async () => {
    if (!user?.tenantId) return;

    setCargandoPersonal(true);
    try {
      const q = query(
        collection(db, "usuarios"),
        where("tenantId", "==", user.tenantId),
      );

      const querySnapshot = await getDocs(q);
      const lista: any[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.rol !== "SUPER_ADMIN") {
          lista.push({ id: doc.id, ...data });
        }
      });

      setPersonal(lista);
    } catch (error) {
      console.error("Error al cargar personal:", error);
    } finally {
      setCargandoPersonal(false);
    }
  };

  const cargarDatosClinica = async () => {
    if (!user?.tenantId) return;

    setCargandoClinica(true);
    try {
      const clinicaDoc = await getDoc(doc(db, "usuarios", user.tenantId));
      if (clinicaDoc.exists()) {
        const data = clinicaDoc.data();
        setDatosClinica({
          nombreClinica: data.nombreClinica || "Mi Consultorio Dental",
          direccion: data.direccion || "",
          telefono: data.telefono || "",
          ciudad: data.ciudad || "",
        });
      }
    } catch (error) {
      console.error("Error al cargar datos de la clínica:", error);
    } finally {
      setCargandoClinica(false);
    }
  };

  useEffect(() => {
    if (user?.tenantId) {
      cargarPersonal();
      cargarDatosClinica();
    }
  }, [user?.tenantId]);

  // ==========================================
  // FUNCIONES: GUARDADO
  // ==========================================

  const guardarPersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreCompleto || !correoGenerado || !user?.tenantId) return;

    setGuardandoPersonal(true);
    try {
      if (usuarioEditandoId) {
        // Actualización
        await updateDoc(doc(db, "usuarios", usuarioEditandoId), {
          nombre: nombreCompleto,
          rol: rolSeleccionado,
        });
        toast({ title: "Usuario actualizado correctamente" });
      } else {
        // Creación mediante API
        const respuesta = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombreAdmin: nombreCompleto,
            email: correoGenerado,
            password: "dentasync",
            rol: rolSeleccionado,
            tenantId: user.tenantId,
            nombreClinica: datosClinica.nombreClinica,
          }),
        });

        const data = await respuesta.json();
        if (!respuesta.ok) throw new Error(data.error);

        alert(
          `Usuario creado exitosamente.\nEmail: ${correoGenerado}\nContraseña Temporal: dentasync`,
        );
      }

      cancelarEdicion();
      cargarPersonal();
    } catch (error: any) {
      console.error("Error:", error);
      alert(`Hubo un error: ${error.message}`);
    } finally {
      setGuardandoPersonal(false);
    }
  };

  const guardarConfiguracionClinica = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.tenantId) return;

    setGuardandoClinica(true);
    try {
      await setDoc(
        doc(db, "usuarios", user.tenantId),
        {
          nombreClinica: datosClinica.nombreClinica,
          direccion: datosClinica.direccion,
          telefono: datosClinica.telefono,
          ciudad: datosClinica.ciudad,
        },
        { merge: true },
      );

      toast({ title: "Detalles del consultorio actualizados" });
    } catch (error) {
      console.error("Error guardando clínica:", error);
      toast({ title: "Error al guardar", variant: "destructive" });
    } finally {
      setGuardandoClinica(false);
    }
  };

  // ==========================================
  // FUNCIONES AUXILIARES
  // ==========================================
  const prepararEdicion = (usr: any) => {
    setUsuarioEditandoId(usr.id);
    setNombreCompleto(usr.nombre);
    setCorreoGenerado(usr.email);
    setRolSeleccionado(usr.rol as RolUsuario);
  };

  const cancelarEdicion = () => {
    setUsuarioEditandoId(null);
    setNombreCompleto("");
    setCorreoGenerado("");
    setRolSeleccionado("ESPECIALISTA");
  };

  const eliminarPersonal = async (id: string, nombre: string, rol: string) => {
    if (rol === "TENANT_ADMIN") {
      alert(
        "Acción denegada: No puedes eliminar la cuenta del dueño de la clínica desde aquí.",
      );
      return;
    }
    if (
      window.confirm(
        `¿Estás seguro que deseas revocar el acceso y eliminar a ${nombre}?`,
      )
    ) {
      try {
        await deleteDoc(doc(db, "usuarios", id));
        cargarPersonal();
        toast({ title: "Acceso revocado exitosamente" });
      } catch (error) {
        alert("Error al intentar eliminar el usuario.");
      }
    }
  };

  const restablecerContrasena = async (email: string) => {
    if (
      window.confirm(
        `¿Deseas enviar un correo a ${email} para que restablezca su contraseña?`,
      )
    ) {
      try {
        await sendPasswordResetEmail(auth, email);
        alert("Correo enviado exitosamente a: " + email);
      } catch (error) {
        alert("Hubo un error. Verifica que el correo exista.");
      }
    }
  };

  // ==========================================
  // CAMBIO DE CONTRASEÑA DIRECTO
  // ==========================================
  const cambiarContrasena = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!contrasenaActual) {
      toast({ title: "Por favor ingresa tu contraseña actual", variant: "destructive" });
      return;
    }
    
    if (!contrasenaNew || !contrasenaNewConfirm) {
      toast({ title: "Por favor completa todos los campos", variant: "destructive" });
      return;
    }

    if (contrasenaNew.length < 6) {
      toast({ title: "La nueva contraseña debe tener al menos 6 caracteres", variant: "destructive" });
      return;
    }

    if (contrasenaNew !== contrasenaNewConfirm) {
      toast({ title: "Las contraseñas nuevas no coinciden", variant: "destructive" });
      return;
    }

    if (contrasenaNew === contrasenaActual) {
      toast({ title: "La nueva contraseña debe ser diferente a la actual", variant: "destructive" });
      return;
    }

    setCambioContrasenaEnProgreso(true);
    try {
      if (!user?.email) {
        throw new Error("No se pudo obtener tu correo electrónico");
      }

      // 1. Re-autenticar al usuario con la contraseña actual
      const credential = EmailAuthProvider.credential(user.email, contrasenaActual);
      await reauthenticateWithCredential(auth.currentUser!, credential);

      // 2. Cambiar a la nueva contraseña
      await updatePassword(auth.currentUser!, contrasenaNew);

      // 3. Limpiar formulario y mostrar éxito
      setContrasenaActual("");
      setContrasenaNew("");
      setContrasenaNewConfirm("");
      setMostradorCambioContrasena(false);
      
      toast({
        title: "¡Contraseña actualizada exitosamente!",
        description: "Tu nueva contraseña ya está activa",
      });
    } catch (error: any) {
      console.error("Error al cambiar contraseña:", error);
      
      if (error.code === "auth/wrong-password") {
        toast({ title: "La contraseña actual es incorrecta", variant: "destructive" });
      } else if (error.code === "auth/weak-password") {
        toast({ title: "La nueva contraseña es muy débil", variant: "destructive" });
      } else {
        toast({ title: "Error al cambiar la contraseña: " + error.message, variant: "destructive" });
      }
    } finally {
      setCambioContrasenaEnProgreso(false);
    }
  };

  const esAdmin = user?.rol === "TENANT_ADMIN" || user?.rol === "SUPER_ADMIN";

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold text-[#2651A3]">Configuración</h1>
        <p className="text-gray-500 mt-1">
          Administra tu perfil, la clínica y los accesos del equipo.
        </p>
      </div>

      <div className="flex gap-2 border-b border-gray-200 pb-px">
        <button
          onClick={() => setTabActiva("perfil")}
          className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors ${tabActiva === "perfil" ? "border-[#39ACB8] text-[#39ACB8]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          Mi Perfil
        </button>
        {esAdmin && (
          <>
            <button
              onClick={() => setTabActiva("consultorio")}
              className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors ${tabActiva === "consultorio" ? "border-[#39ACB8] text-[#39ACB8]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              Detalles del Consultorio
            </button>
            <button
              onClick={() => setTabActiva("personal")}
              className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors ${tabActiva === "personal" ? "border-[#39ACB8] text-[#39ACB8]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              Gestión de Personal
            </button>
          </>
        )}
      </div>

      <div className="mt-6">
        {/* PESTAÑA PERFIL */}
        {tabActiva === "perfil" && (
          <div className="max-w-xl bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-[#2651A3]">
                <UserCircle size={40} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {user?.displayName || user?.nombre || "Usuario"}
                </h2>
                <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                  <span className="bg-slate-100 px-2 py-0.5 rounded border text-xs font-bold uppercase">
                    {user?.rol === "TENANT_ADMIN"
                      ? "DIRECTOR MÉDICO"
                      : user?.rol?.replace("_", " ")}
                  </span>
                </p>
                <p className="text-xs text-[#2651A3] mt-1">{user?.email}</p>
              </div>
            </div>
            <div className="space-y-4 pt-4 border-t">
              <Button
                variant="outline"
                className="w-full justify-start text-gray-700"
                onClick={() => setMostradorCambioContrasena(!mostradorCambioContrasena)}
              >
                <KeyRound className="w-4 h-4 mr-2" /> {mostradorCambioContrasena ? "Cancelar Cambio" : "Cambiar Contraseña"}
              </Button>
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={() => signOut(auth)}
              >
                <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión Segura
              </Button>
            </div>

            {/* FORMULARIO DE CAMBIO DE CONTRASEÑA */}
            {mostradorCambioContrasena && (
              <div className="pt-6 border-t space-y-4 bg-blue-50 p-4 rounded-lg animate-in slide-in-from-top-2">
                <div>
                  <h3 className="font-bold text-sm text-gray-800 mb-4">Cambiar Contraseña</h3>
                  <p className="text-xs text-gray-600 mb-4">Por seguridad, debes ingresar tu contraseña actual para establecer una nueva.</p>
                </div>
                
                <form onSubmit={cambiarContrasena} className="space-y-3">
                  {/* Contraseña Actual */}
                  <div className="space-y-1.5">
                    <Label htmlFor="contrasena-actual" className="text-xs font-bold">
                      Contraseña Actual
                    </Label>
                    <div className="relative">
                      <Input
                        id="contrasena-actual"
                        type="password"
                        value={contrasenaActual}
                        onChange={(e) => setContrasenaActual(e.target.value)}
                        placeholder="Ingresa tu contraseña actual"
                        className="bg-white"
                        disabled={cambioContrasenaEnProgreso}
                      />
                    </div>
                  </div>

                  {/* Contraseña Nueva */}
                  <div className="space-y-1.5">
                    <Label htmlFor="contrasena-new" className="text-xs font-bold">
                      Nueva Contraseña
                    </Label>
                    <div className="relative">
                      <Input
                        id="contrasena-new"
                        type={mostrarContrasenarNew ? "text" : "password"}
                        value={contrasenaNew}
                        onChange={(e) => setContrasenaNew(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="bg-white pr-10"
                        disabled={cambioContrasenaEnProgreso}
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarContrasenarNew(!mostrarContrasenarNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {mostrarContrasenarNew ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirmar Nueva Contraseña */}
                  <div className="space-y-1.5">
                    <Label htmlFor="contrasena-confirm" className="text-xs font-bold">
                      Confirmar Nueva Contraseña
                    </Label>
                    <div className="relative">
                      <Input
                        id="contrasena-confirm"
                        type={mostrarContrasenarConfirm ? "text" : "password"}
                        value={contrasenaNewConfirm}
                        onChange={(e) => setContrasenaNewConfirm(e.target.value)}
                        placeholder="Repite tu nueva contraseña"
                        className="bg-white pr-10"
                        disabled={cambioContrasenaEnProgreso}
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarContrasenarConfirm(!mostrarContrasenarConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {mostrarContrasenarConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Botones de Acción */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      type="submit"
                      className="flex-1 bg-[#2651A3] hover:bg-[#1e4082] text-white"
                      disabled={cambioContrasenaEnProgreso}
                    >
                      {cambioContrasenaEnProgreso ? "Actualizando..." : "Actualizar Contraseña"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setMostradorCambioContrasena(false);
                        setContrasenaActual("");
                        setContrasenaNew("");
                        setContrasenaNewConfirm("");
                      }}
                      disabled={cambioContrasenaEnProgreso}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA CONSULTORIO */}
        {tabActiva === "consultorio" && esAdmin && (
          <div className="max-w-xl bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Identidad del Consultorio
                </h2>
                <p className="text-xs text-gray-500">
                  Esta información aparecerá en los reportes y recetas.
                </p>
              </div>
            </div>

            {cargandoClinica ? (
              <p className="text-sm text-gray-500 py-4">Cargando datos...</p>
            ) : (
              <form
                onSubmit={guardarConfiguracionClinica}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <Label>Nombre Comercial de la Clínica</Label>
                  <Input
                    value={datosClinica.nombreClinica}
                    onChange={(e) =>
                      setDatosClinica({
                        ...datosClinica,
                        nombreClinica: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Dirección Completa
                  </Label>
                  <Input
                    placeholder="Ej. Av. Principal #123, Edif. Central"
                    value={datosClinica.direccion}
                    onChange={(e) =>
                      setDatosClinica({
                        ...datosClinica,
                        direccion: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Teléfono / WhatsApp
                    </Label>
                    <Input
                      placeholder="Ej. 77012345"
                      value={datosClinica.telefono}
                      onChange={(e) =>
                        setDatosClinica({
                          ...datosClinica,
                          telefono: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Ciudad</Label>
                    <Input
                      placeholder="Ej. La Paz"
                      value={datosClinica.ciudad}
                      onChange={(e) =>
                        setDatosClinica({
                          ...datosClinica,
                          ciudad: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="pt-4 border-t mt-4 flex justify-end">
                  <Button
                    type="submit"
                    className="bg-[#39ACB8] hover:bg-[#2c8892]"
                    disabled={guardandoClinica}
                  >
                    {guardandoClinica ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* PESTAÑA PERSONAL (Aislada por Tenant) */}
        {tabActiva === "personal" && esAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Formulario (Crear o Editar) */}
            <div className="md:col-span-5 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
              <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <div
                  className={`p-2 rounded-lg ${usuarioEditandoId ? "bg-orange-100" : "bg-[#2651A3]/10"}`}
                >
                  {usuarioEditandoId ? (
                    <Pencil className="text-orange-600 w-6 h-6" />
                  ) : (
                    <UserPlus className="text-[#2651A3] w-6 h-6" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {usuarioEditandoId
                      ? "Modificar Personal"
                      : "Registrar Personal"}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    {usuarioEditandoId
                      ? "Actualizando datos del usuario"
                      : "El acceso se creará automáticamente"}
                  </p>
                </div>
              </div>

              <form onSubmit={guardarPersonal} className="space-y-4">
                <div className="space-y-1">
                  <Label>Nombre Completo</Label>
                  <Input
                    placeholder="Ej. EDSON GUARACHI ALARCON"
                    value={nombreCompleto}
                    onChange={(e) =>
                      setNombreCompleto(e.target.value.toUpperCase())
                    }
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label>Cargo / Rol en el sistema</Label>
                  <select
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={rolSeleccionado}
                    onChange={(e) =>
                      setRolSeleccionado(e.target.value as RolUsuario)
                    }
                  >
                    {/* 🔥 CORRECCIÓN: Los values ahora coinciden con RolUsuario */}
                    <option value="ESPECIALISTA">
                      👨‍⚕️ Especialista / Doctor
                    </option>
                    <option value="SECRETARIA">
                      👩‍💻 Secretaria / Recepción / Asistente
                    </option>
                  </select>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3 mt-4">
                  <div>
                    <Label className="text-xs text-gray-500 uppercase">
                      Usuario (Email Corporativo)
                    </Label>
                    <Input
                      value={correoGenerado}
                      // 🔥 LE QUITAMOS EL "disabled" Y LE AGREGAMOS EL onChange
                      onChange={(e) =>
                        setCorreoGenerado(e.target.value.toLowerCase())
                      }
                      className="font-mono text-sm font-bold text-[#2651A3] bg-white mt-1"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      * Puedes modificar este correo manualmente si ya está en
                      uso.
                    </p>
                  </div>
                  {!usuarioEditandoId && (
                    <div>
                      <Label className="text-xs text-gray-500 uppercase">
                        Contraseña Temporal
                      </Label>
                      <p className="font-mono text-sm font-bold text-gray-700 bg-white p-2 rounded border mt-1">
                        dentasync
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  {usuarioEditandoId && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={cancelarEdicion}
                    >
                      Cancelar
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className={`w-full ${usuarioEditandoId ? "bg-orange-500 hover:bg-orange-600" : "bg-[#39ACB8] hover:bg-[#2c8892]"}`}
                    disabled={guardandoPersonal}
                  >
                    {guardandoPersonal
                      ? "Guardando..."
                      : usuarioEditandoId
                        ? "Guardar Cambios"
                        : "Crear Accesos"}
                  </Button>
                </div>
              </form>
            </div>

            {/* Lista de Personal Activo */}
            <div className="md:col-span-7 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
              <h2 className="text-lg font-bold text-gray-800 mb-4 shrink-0 flex items-center justify-between">
                Equipo Registrado
                <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 font-normal">
                  Total: {personal.length}
                </span>
              </h2>

              <ScrollArea className="flex-1 -mx-2 px-2">
                {cargandoPersonal ? (
                  <p className="text-sm text-center text-gray-500 py-4">
                    Cargando equipo...
                  </p>
                ) : personal.length === 0 ? (
                  <p className="text-sm text-center text-gray-400 py-4">
                    No hay personal registrado aún.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {personal.map((usr) => (
                      <div
                        key={usr.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 border rounded-lg hover:bg-gray-100 transition-colors gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-800">
                              {usr.nombre}
                            </span>
                            <span
                              className={`px-2 py-0.5 border rounded text-[10px] font-bold uppercase ${usr.rol === "TENANT_ADMIN" ? "bg-purple-100 text-purple-700 border-purple-200" : "bg-white text-gray-600"}`}
                            >
                              {usr.rol === "TENANT_ADMIN"
                                ? "DUEÑO / DIRECTOR"
                                : usr.rol}
                            </span>
                          </div>
                          <span className="text-xs text-[#2651A3] font-mono flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {usr.email}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 sm:border-l sm:pl-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-orange-500 hover:text-orange-700 hover:bg-orange-50"
                            title="Modificar Rol o Nombre"
                            onClick={() => prepararEdicion(usr)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Eliminar Usuario"
                            onClick={() =>
                              eliminarPersonal(usr.id, usr.nombre, usr.rol)
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
