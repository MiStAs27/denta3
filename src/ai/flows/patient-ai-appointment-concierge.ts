'use server';
/**
 * @fileOverview Una interfaz conversacional impulsada por IA para que los pacientes gestionen sus citas dentales.
 *
 * - patientAIAppointmentConcierge - Función que maneja las solicitudes de los pacientes para reservar, reprogramar o cancelar citas.
 * - PatientAIAppointmentConciergeInput - El tipo de entrada para la función.
 * - PatientAIAppointmentConciergeOutput - El tipo de salida para la función.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PatientAIAppointmentConciergeInputSchema = z.object({
  patientId: z.string().describe('El identificador único del paciente que realiza la solicitud.'),
  message: z.string().describe('El mensaje del paciente, que contiene su solicitud para reservar, reprogramar o cancelar una cita.'),
});
export type PatientAIAppointmentConciergeInput = z.infer<typeof PatientAIAppointmentConciergeInputSchema>;

const PatientAIAppointmentConciergeOutputSchema = z.object({
  response: z.string().describe('La respuesta conversacional del conserje de IA al paciente.'),
  actionTaken: z.enum(['none', 'booked', 'rescheduled', 'cancelled', 'info_needed']).describe('Indica el tipo de acción que tomó o pretende tomar la IA.'),
  details: z.object({
    appointmentId: z.string().optional().describe('El ID de la cita si se tomó una acción.'),
    confirmation: z.string().optional().describe('Un mensaje de confirmación de la acción.'),
    missingInfo: z.array(z.string()).optional().describe('Lista de información que aún se necesita del paciente para completar una acción.'),
  }).optional().describe('Detalles adicionales sobre la acción tomada o la información necesaria.'),
});
export type PatientAIAppointmentConciergeOutput = z.infer<typeof PatientAIAppointmentConciergeOutputSchema>;

/**
 * Herramienta mock para simular la reserva de una cita.
 */
const bookAppointmentTool = ai.defineTool(
  {
    name: 'bookAppointment',
    description: 'Reserva una nueva cita dental para un paciente.',
    inputSchema: z.object({
      patientId: z.string().describe('El identificador único del paciente.'),
      date: z.string().describe('La fecha deseada para la cita (ej., "YYYY-MM-DD").'),
      time: z.string().describe('La hora deseada para la cita (ej., "HH:MM").'),
      serviceType: z.string().describe('El tipo de servicio dental solicitado (ej., "limpieza", "chequeo", "empaste").'),
    }),
    outputSchema: z.object({
      appointmentId: z.string(),
      confirmationMessage: z.string(),
    }),
  },
  async ({ patientId, date, time, serviceType }) => {
    console.log(`Mock: Reservando cita para el paciente ${patientId} el ${date} a las ${time} para ${serviceType}`);
    const appointmentId = `appt-${Math.random().toString(36).substring(2, 9)}`;
    return {
      appointmentId,
      confirmationMessage: `Su cita para ${serviceType} ha sido reservada para el ${date} a las ${time}. Su ID de cita es ${appointmentId}.`,
    };
  }
);

/**
 * Herramienta mock para simular la reprogramación de una cita.
 */
const rescheduleAppointmentTool = ai.defineTool(
  {
    name: 'rescheduleAppointment',
    description: 'Reprograma una cita dental existente para un paciente.',
    inputSchema: z.object({
      patientId: z.string().describe('El identificador único del paciente.'),
      oldDate: z.string().optional().describe('La fecha original de la cita si se conoce.'),
      oldTime: z.string().optional().describe('La hora original de la cita si se conoce.'),
      appointmentId: z.string().optional().describe('El ID de la cita a reprogramar.'),
      newDate: z.string().describe('La nueva fecha deseada para la cita.'),
      newTime: z.string().describe('La nueva hora deseada para la cita.'),
    }),
    outputSchema: z.object({
      appointmentId: z.string(),
      confirmationMessage: z.string(),
    }),
  },
  async ({ patientId, appointmentId, newDate, newTime }) => {
    console.log(`Mock: Reprogramando cita ${appointmentId} para el paciente ${patientId} al ${newDate} a las ${newTime}`);
    return {
      appointmentId: appointmentId || 'new-id',
      confirmationMessage: `Su cita ha sido reprogramada para el ${newDate} a las ${newTime}.`,
    };
  }
);

/**
 * Herramienta mock para simular la cancelación de una cita.
 */
const cancelAppointmentTool = ai.defineTool(
  {
    name: 'cancelAppointment',
    description: 'Cancela una cita dental existente para un paciente.',
    inputSchema: z.object({
      patientId: z.string().describe('El identificador único del paciente.'),
      appointmentId: z.string().optional().describe('El ID de la cita a cancelar.'),
      date: z.string().optional().describe('La fecha de la cita a cancelar.'),
      time: z.string().optional().describe('La hora de la cita a cancelar.'),
    }),
    outputSchema: z.object({
      cancellationMessage: z.string(),
    }),
  },
  async ({ appointmentId }) => {
    return {
      cancellationMessage: `Su cita ${appointmentId} ha sido cancelada con éxito.`,
    };
  }
);

const patientAIAppointmentConciergePrompt = ai.definePrompt({
  name: 'patientAIAppointmentConciergePrompt',
  input: { schema: PatientAIAppointmentConciergeInputSchema },
  output: { schema: PatientAIAppointmentConciergeOutputSchema },
  tools: [bookAppointmentTool, rescheduleAppointmentTool, cancelAppointmentTool],
  prompt: `Eres DentaSync, un conserje de citas dentales impulsado por IA. Tu función es ayudar a los pacientes a gestionar sus citas.

Sé siempre amable, empático y profesional. Entiende la solicitud del paciente para reservar, reprogramar o cancelar citas.

Utiliza las herramientas proporcionadas para realizar estas acciones. Si necesitas más información para usar una herramienta, pídela cortésmente al paciente, especificando exactamente qué falta (ej., fecha, hora, tipo de servicio o ID de cita).

Después de realizar con éxito una acción, proporciona un mensaje de confirmación claro y establece los campos 'actionTaken' y 'details' en el esquema de salida.
Si no puedes cumplir con la solicitud por falta de información, establece 'actionTaken' en 'info_needed' y enumera los detalles faltantes en 'missingInfo'.

ID del Paciente: {{{patientId}}}
Mensaje del Paciente: {{{message}}}`,
});

export async function patientAIAppointmentConcierge(input: PatientAIAppointmentConciergeInput): Promise<PatientAIAppointmentConciergeOutput> {
  return patientAIAppointmentConciergeFlow(input);
}

const patientAIAppointmentConciergeFlow = ai.defineFlow(
  {
    name: 'patientAIAppointmentConciergeFlow',
    inputSchema: PatientAIAppointmentConciergeInputSchema,
    outputSchema: PatientAIAppointmentConciergeOutputSchema,
  },
  async (input) => {
    const { output } = await patientAIAppointmentConciergePrompt(input);
    return output!;
  }
);
