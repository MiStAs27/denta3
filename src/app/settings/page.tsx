"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { signOut, sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Building2, UserCircle, LogOut, Trash2, KeyRound, Pencil, Mail } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function SettingsPage() {
  const [tabActiva, setTabActiva] = useState('personal'); 

  // Estados para Gestión de Personal
  const [personal, setPersonal] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Estados del formulario
  const [usuarioEditandoId, setUsuarioEditandoId] = useState<string | null>(null);
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [correoGenerado, setCorreoGenerado] = useState("");
  const [rolSeleccionado, setRolSeleccionado] = useState("ESPECIALISTA");

  // Generar correo solo si NO estamos editando a un usuario existente
  useEffect(() => {
    if (usuarioEditandoId) return; // Si estamos editando, no recalculamos el correo

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

  const cargarPersonal = async () => {
    setCargando(true);
    try {
      const querySnapshot = await getDocs(collection(db, "usuarios"));
      const lista: any[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // REGLA DE SEGURIDAD 1: No mostrar a los Super Admins en la lista del consultorio
        if (data.rol !== "SUPER_ADMIN") {
          lista.push({ id: doc.id, ...data });
        }
      });
      
      setPersonal(lista);
    } catch (error) {
      console.error("Error al cargar personal:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPersonal();
  }, []);

  // --- NUEVAS FUNCIONES DE ACCIÓN ---

  const guardarPersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreCompleto || !correoGenerado) return;
    
    setGuardando(true);
    try {
      if (usuarioEditandoId) {
        // MODO EDICIÓN: La actualización normal se queda igual porque no cambia accesos
        await updateDoc(doc(db, "usuarios", usuarioEditandoId), {
          nombre: nombreCompleto,
          rol: rolSeleccionado,
        });
        alert("Usuario actualizado correctamente.");
      } else {
        // MODO CREACIÓN: Llamamos a nuestra nueva API segura
        const respuesta = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: nombreCompleto,
            email: correoGenerado,
            rol: rolSeleccionado
          })
        });

        const data = await respuesta.json();
        
        // Si el servidor (API) nos devuelve un error, detenemos el proceso
        if (!respuesta.ok) {
          throw new Error(data.error || 'Error desconocido al crear el usuario');
        }

        alert(`Usuario creado exitosamente.\nEmail: ${correoGenerado}\nContraseña: dentasync`);
      }
      
      cancelarEdicion();
      cargarPersonal();
    } catch (error: any) {
      console.error("Error al guardar personal:", error);
      alert(`Hubo un error: ${error.message}`);
    } finally {
      setGuardando(false);
    }
  };

  const prepararEdicion = (user: any) => {
    setUsuarioEditandoId(user.id);
    setNombreCompleto(user.nombre);
    setCorreoGenerado(user.email);
    setRolSeleccionado(user.rol);
  };

  const cancelarEdicion = () => {
    setUsuarioEditandoId(null);
    setNombreCompleto("");
    setCorreoGenerado("");
    setRolSeleccionado("ESPECIALISTA");
  };

  const eliminarPersonal = async (id: string, nombre: string, rol: string) => {
    // REGLA DE SEGURIDAD 2: Bloquear la eliminación desde el código
    if (rol === "SUPER_ADMIN") {
      alert("Acción denegada: No tienes permisos para eliminar una cuenta administrativa global.");
      return;
    }

    if (window.confirm(`¿Estás seguro que deseas revocar el acceso y eliminar a ${nombre}?`)) {
      try {
        await deleteDoc(doc(db, "usuarios", id));
        cargarPersonal();
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Error al intentar eliminar el usuario.");
      }
    }
  };

  const restablecerContrasena = async (email: string) => {
    if (window.confirm(`¿Deseas enviar un correo a ${email} para que el usuario restablezca su contraseña?`)) {
      try {
        await sendPasswordResetEmail(auth, email);
        alert("Correo de recuperación enviado exitosamente a: " + email);
      } catch (error) {
        console.error("Error al enviar correo:", error);
        alert("Hubo un error. Verifica que el correo esté registrado en Authentication.");
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      
      <div>
        <h1 className="text-3xl font-bold text-[#2651A3]">Configuración</h1>
        <p className="text-gray-500 mt-1">Administra tu perfil, la clínica y los accesos del equipo.</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200 pb-px">
        <button onClick={() => setTabActiva('perfil')} className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors ${tabActiva === 'perfil' ? 'border-[#39ACB8] text-[#39ACB8]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Mi Perfil</button>
        <button onClick={() => setTabActiva('consultorio')} className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors ${tabActiva === 'consultorio' ? 'border-[#39ACB8] text-[#39ACB8]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Detalles del Consultorio</button>
        <button onClick={() => setTabActiva('personal')} className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors ${tabActiva === 'personal' ? 'border-[#39ACB8] text-[#39ACB8]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Gestión de Personal</button>
      </div>

      <div className="mt-6">
        
        {/* PESTAÑA PERFIL Y CONSULTORIO (Se mantienen igual) */}
        {tabActiva === 'perfil' && (
          <div className="max-w-xl bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-[#2651A3]"><UserCircle size={40} /></div>
              <div><h2 className="text-xl font-bold">Administrador</h2><p className="text-sm text-gray-500">Super Admin</p></div>
            </div>
            <div className="space-y-4 pt-4 border-t">
              <Button variant="outline" className="w-full justify-start text-gray-700" onClick={() => restablecerContrasena("tu-correo-admin@dentasync.com")}>
                <KeyRound className="w-4 h-4 mr-2" /> Cambiar mi contraseña
              </Button>
              <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
              </Button>
            </div>
          </div>
        )}

        {tabActiva === 'consultorio' && (
          <div className="max-w-xl bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="text-[#2651A3] w-6 h-6"/>
              <h2 className="text-xl font-bold text-gray-800">Información General</h2>
            </div>
            <form className="space-y-4">
              <div className="space-y-1"><Label>Nombre de la Clínica</Label><Input defaultValue="DentaSync La Paz" /></div>
              <div className="space-y-1"><Label>Dirección</Label><Input defaultValue="Zona Sur, La Paz" /></div>
              <div className="space-y-1"><Label>Moneda Principal</Label><Input defaultValue="Bolivianos (BOB)" disabled /></div>
              <Button className="bg-[#39ACB8] hover:bg-[#2c8892]">Guardar Cambios</Button>
            </form>
          </div>
        )}

        {/* PESTAÑA PERSONAL ACTUALIZADA */}
        {tabActiva === 'personal' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Formulario (Crear o Editar) */}
            <div className="md:col-span-5 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit transition-all">
              <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <div className={`p-2 rounded-lg ${usuarioEditandoId ? 'bg-orange-100' : 'bg-[#2651A3]/10'}`}>
                  {usuarioEditandoId ? <Pencil className="text-orange-600 w-6 h-6"/> : <UserPlus className="text-[#2651A3] w-6 h-6"/>}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {usuarioEditandoId ? "Modificar Personal" : "Registrar Personal"}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    {usuarioEditandoId ? "Actualizando datos del usuario" : "El acceso se creará automáticamente"}
                  </p>
                </div>
              </div>

              <form onSubmit={guardarPersonal} className="space-y-4">
                <div className="space-y-1">
                  <Label>Nombre Completo</Label>
                  <Input 
                    placeholder="Ej. EDSON GUARACHI ALARCON" 
                    value={nombreCompleto} 
                    onChange={(e) => setNombreCompleto(e.target.value.toUpperCase())} 
                    required 
                  />
                </div>

                <div className="space-y-1">
                  <Label>Cargo / Rol en el sistema</Label>
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={rolSeleccionado}
                    onChange={(e) => setRolSeleccionado(e.target.value)}
                  >
                    <option value="ESPECIALISTA">👨‍⚕️ Especialista / Doctor</option>
                    <option value="SECRETARIA">👩‍💻 Secretaria / Recepción</option>
                    <option value="ASISTENTE">🦷 Asistente Dental</option>
                    <option value="TENANT_ADMIN">⚙️ Administrador</option>
                  </select>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3 mt-4">
                  <div>
                    <Label className="text-xs text-gray-500 uppercase">Usuario (Email Corporativo)</Label>
                    <Input 
                      value={correoGenerado} 
                      disabled 
                      className="font-mono text-sm font-bold text-[#2651A3] bg-white mt-1"
                    />
                  </div>
                  {!usuarioEditandoId && (
                    <div>
                      <Label className="text-xs text-gray-500 uppercase">Contraseña Temporal</Label>
                      <p className="font-mono text-sm font-bold text-gray-700 bg-white p-2 rounded border mt-1">dentasync</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  {usuarioEditandoId && (
                    <Button type="button" variant="outline" className="w-full" onClick={cancelarEdicion}>
                      Cancelar
                    </Button>
                  )}
                  <Button type="submit" className={`w-full ${usuarioEditandoId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-[#39ACB8] hover:bg-[#2c8892]'}`} disabled={guardando}>
                    {guardando ? "Guardando..." : (usuarioEditandoId ? "Guardar Cambios" : "Crear Accesos")}
                  </Button>
                </div>
              </form>
            </div>

            {/* Lista de Personal Activo con Botones de Acción */}
            <div className="md:col-span-7 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
              <h2 className="text-lg font-bold text-gray-800 mb-4 shrink-0">Equipo Registrado</h2>
              
              <ScrollArea className="flex-1 -mx-2 px-2">
                {cargando ? (
                  <p className="text-sm text-center text-gray-500 py-4">Cargando equipo...</p>
                ) : personal.length === 0 ? (
                  <p className="text-sm text-center text-gray-400 py-4">No hay personal registrado aún.</p>
                ) : (
                  <div className="space-y-3">
                    {personal.map((user) => (
                      <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 border rounded-lg hover:bg-gray-100 transition-colors gap-4">
                        
                        {/* Datos del usuario */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-800">{user.nombre}</span>
                            <span className="px-2 py-0.5 bg-white border rounded text-[10px] font-bold text-gray-600 uppercase">
                              {user.rol}
                            </span>
                          </div>
                          <span className="text-xs text-[#2651A3] font-mono flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {user.email}
                          </span>
                        </div>

                        {/* Botonera de acciones */}
                        <div className="flex items-center gap-1 sm:border-l sm:pl-4">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-orange-500 hover:text-orange-700 hover:bg-orange-50" 
                            title="Modificar Rol o Nombre"
                            onClick={() => prepararEdicion(user)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50" 
                            title="Restablecer Contraseña (Enviar Email)"
                            onClick={() => restablecerContrasena(user.email)}
                          >
                            <KeyRound className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 hover:text-red-700 hover:bg-red-50" 
                            title="Eliminar Usuario"
                            onClick={() => eliminarPersonal(user.id, user.nombre, user.rol)}
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