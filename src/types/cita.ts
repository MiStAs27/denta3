// src/types/cita.ts

// 1. Agregamos 'pendiente' y 'reprogramada' a los estados permitidos
export type EstadoCita = 'programada' | 'pendiente' | 'confirmada' | 'completada' | 'cancelada' | 'no_asistio' | 'reprogramada';

export interface Cita {
  id?: string;
  pacienteId: string;
  pacienteNombre: string; 
  especialistaId: string; 
  fecha: string; 
  horaInicio: string; 
  horaFin: string; 
  motivo: string; 
  estado: EstadoCita; // Ahora TypeScript ya no marcará error aquí
  notasOpcionales?: string;
  fechaReprogramada?: string; // Agregamos este campo que creamos en el paso anterior
}