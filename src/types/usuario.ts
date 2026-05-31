import { RolUsuario } from './roles';

export interface UsuarioApp {
  uid: string; // El ID que te da Firebase Authentication
  email: string;
  nombre: string;
  rol: RolUsuario;
  clinicId?: string; // 🔥 Opcional porque el SUPER_ADMIN no pertenece a ninguna clínica en particular, pero obligatorio para los demás.
  activo: boolean; // Útil si el dueño del consultorio quiere desactivar a un empleado
}