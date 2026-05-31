export type EstadoSuscripcion = 'activa' | 'inactiva' | 'prueba';

export interface Clinica {
  id?: string; // ID generado por Firebase
  nombre: string;
  direccion: string;
  telefono: string;
  estadoSuscripcion: EstadoSuscripcion;
  fechaCreacion: string;
  // Aquí podrías agregar más configuraciones específicas de cada consultorio en el futuro
  // ej: logoUrl, colores, horarioAtencion, etc.
}