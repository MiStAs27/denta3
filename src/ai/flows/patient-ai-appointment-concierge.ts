'use server';
/**
 * @fileOverview An AI-powered conversational interface for patients to manage their dental appointments.
 *
 * - patientAIAppointmentConcierge - A function that handles patient requests for booking, rescheduling, or canceling appointments.
 * - PatientAIAppointmentConciergeInput - The input type for the patientAIAppointmentConcierge function.
 * - PatientAIAppointmentConciergeOutput - The return type for the patientAIAppointmentConcierge function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PatientAIAppointmentConciergeInputSchema = z.object({
  patientId: z.string().describe('The unique identifier for the patient making the request.'),
  message: z.string().describe('The patient\'s message, containing their request to book, reschedule, or cancel an appointment.'),
});
export type PatientAIAppointmentConciergeInput = z.infer<typeof PatientAIAppointmentConciergeInputSchema>;

const PatientAIAppointmentConciergeOutputSchema = z.object({
  response: z.string().describe('The AI concierge\'s conversational response to the patient.'),
  actionTaken: z.enum(['none', 'booked', 'rescheduled', 'cancelled', 'info_needed']).describe('Indicates the type of action the AI took or intends to take.'),
  details: z.object({
    appointmentId: z.string().optional().describe('The ID of the appointment if an action was taken.'),
    confirmation: z.string().optional().describe('A confirmation message from the action.'),
    missingInfo: z.array(z.string()).optional().describe('List of information still needed from the patient to complete an action.'),
  }).optional().describe('Additional details about the action taken or information needed.'),
});
export type PatientAIAppointmentConciergeOutput = z.infer<typeof PatientAIAppointmentConciergeOutputSchema>;

/**
 * Mock tool to simulate booking an appointment.
 * In a real application, this would interact with a database or appointment service.
 */
const bookAppointmentTool = ai.defineTool(
  {
    name: 'bookAppointment',
    description: 'Books a new dental appointment for a patient.',
    inputSchema: z.object({
      patientId: z.string().describe('The unique identifier of the patient.'),
      date: z.string().describe('The desired date for the appointment (e.g., "YYYY-MM-DD").'),
      time: z.string().describe('The desired time for the appointment (e.g., "HH:MM").'),
      serviceType: z.string().describe('The type of dental service requested (e.g., "cleaning", "check-up", "filling").'),
    }),
    outputSchema: z.object({
      appointmentId: z.string(),
      confirmationMessage: z.string(),
    }),
  },
  async ({ patientId, date, time, serviceType }) => {
    // Simulate API call or database interaction
    console.log(`Mock: Booking appointment for patient ${patientId} on ${date} at ${time} for ${serviceType}`);
    const appointmentId = `appt-${Math.random().toString(36).substring(2, 9)}`;
    return {
      appointmentId,
      confirmationMessage: `Your ${serviceType} appointment is booked for ${date} at ${time}. Your appointment ID is ${appointmentId}.`,
    };
  }
);

/**
 * Mock tool to simulate rescheduling an appointment.
 * In a real application, this would interact with a database or appointment service.
 */
const rescheduleAppointmentTool = ai.defineTool(
  {
    name: 'rescheduleAppointment',
    description: 'Reschedules an existing dental appointment for a patient.',
    inputSchema: z.object({
      patientId: z.string().describe('The unique identifier of the patient.'),
      oldDate: z.string().optional().describe('The original date of the appointment if known (e.g., "YYYY-MM-DD").'),
      oldTime: z.string().optional().describe('The original time of the appointment if known (e.g., "HH:MM").'),
      appointmentId: z.string().optional().describe('The ID of the appointment to reschedule.'),
      newDate: z.string().describe('The new desired date for the appointment (e.g., "YYYY-MM-DD").'),
      newTime: z.string().describe('The new desired time for the appointment (e.g., "HH:MM").'),
    }).refine(data => data.appointmentId || (data.oldDate && data.oldTime), {
      message: "Either 'appointmentId' or both 'oldDate' and 'oldTime' must be provided to identify the appointment."
    }),
    outputSchema: z.object({
      appointmentId: z.string(),
      confirmationMessage: z.string(),
    }),
  },
  async ({ patientId, oldDate, oldTime, appointmentId, newDate, newTime }) => {
    // Simulate API call or database interaction
    const targetApptId = appointmentId || `(identified by ${oldDate} at ${oldTime})`;
    console.log(`Mock: Rescheduling appointment ${targetApptId} for patient ${patientId} to ${newDate} at ${newTime}`);
    const newApptId = appointmentId || `appt-${Math.random().toString(36).substring(2, 9)}`; // If no ID provided, assume new ID on reschedule
    return {
      appointmentId: newApptId,
      confirmationMessage: `Your appointment ${targetApptId} has been rescheduled to ${newDate} at ${newTime}. Your new appointment ID is ${newApptId}.`,
    };
  }
);

/**
 * Mock tool to simulate canceling an appointment.
 * In a real application, this would interact with a database or appointment service.
 */
const cancelAppointmentTool = ai.defineTool(
  {
    name: 'cancelAppointment',
    description: 'Cancels an existing dental appointment for a patient.',
    inputSchema: z.object({
      patientId: z.string().describe('The unique identifier of the patient.'),
      appointmentId: z.string().optional().describe('The ID of the appointment to cancel.'),
      date: z.string().optional().describe('The date of the appointment to cancel (e.g., "YYYY-MM-DD").'),
      time: z.string().optional().describe('The time of the appointment to cancel (e.g., "HH:MM").'),
    }).refine(data => data.appointmentId || (data.date && data.time), {
      message: "Either 'appointmentId' or both 'date' and 'time' must be provided to identify the appointment."
    }),
    outputSchema: z.object({
      cancellationMessage: z.string(),
    }),
  },
  async ({ patientId, appointmentId, date, time }) => {
    // Simulate API call or database interaction
    const targetApptId = appointmentId || `(identified by ${date} at ${time})`;
    console.log(`Mock: Canceling appointment ${targetApptId} for patient ${patientId}`);
    return {
      cancellationMessage: `Your appointment ${targetApptId} has been successfully canceled. We look forward to seeing you again.`,
    };
  }
);

const patientAIAppointmentConciergePrompt = ai.definePrompt({
  name: 'patientAIAppointmentConciergePrompt',
  input: { schema: PatientAIAppointmentConciergeInputSchema },
  output: { schema: PatientAIAppointmentConciergeOutputSchema },
  tools: [bookAppointmentTool, rescheduleAppointmentTool, cancelAppointmentTool],
  prompt: `You are DentaSync, an AI-powered dental appointment concierge. Your role is to assist patients in managing their appointments.

Always be friendly, empathetic, and professional. Understand the patient's request to book, reschedule, or cancel appointments.

Use the provided tools to perform these actions. If you need more information to use a tool, politely ask the patient for it, specifying exactly what\'s missing (e.g., date, time, service type, or appointment ID).

After successfully performing an action, provide a clear confirmation message to the patient and set the 'actionTaken' and 'details' fields in the output schema accordingly.
If you cannot fulfill the request due to missing information, set 'actionTaken' to 'info_needed' and list the missing details in the 'missingInfo' array within 'details'.
If no specific action is taken, set 'actionTaken' to 'none'.

Patient ID: {{{patientId}}}
Patient Message: {{{message}}}`,
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
