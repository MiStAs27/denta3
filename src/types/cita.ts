// src/types/cita.ts

export type EstadoCita = 'programada' | 'confirmada' | 'completada' | 'cancelada' | 'no_asistio';

export interface Cita {
  id?: string;
  pacienteId: string;
  pacienteNombre: string; // Lo guardamos para no tener que buscar el paciente cada vez
  especialistaId: string; // ID del doctor que atenderá
  fecha: string; // Formato YYYY-MM-DD
  horaInicio: string; // Formato HH:MM (ej. 14:30)
  horaFin: string; // Formato HH:MM (ej. 15:00)
  motivo: string; // Ej. "Limpieza", "Extracción", "Consulta inicial"
  estado: EstadoCita;
  notasOpcionales?: string;
}