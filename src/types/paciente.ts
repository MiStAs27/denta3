// src/types/paciente.ts

export interface ContactoEmergencia {
  nombre: string;
  parentesco: string;
  celular: string;
}

export interface AntecedentesPatologicos {
  observaciones: string; // Texto libre
  alergias: string;
  embarazo: boolean;
}

export interface Paciente {
  id?: string; // ID generado por Firebase Firestore
  nombre: string;
  ci: string;
  saldoPendiente: number;
  domicilio: string;
  lugarTrabajo: string;
  fechaCreacion: string; // ISO String o Timestamp de Firebase
  edad: number;
  fechaNacimiento: string; // YYYY-MM-DD
  celular: string;
  contactoEmergencia: ContactoEmergencia;
  antecedentes: AntecedentesPatologicos;
}