'use server';
/**
 * @fileOverview An AI-powered tool that suggests optimal appointment slots for patients.
 *
 * - aiOptimizedAppointmentScheduling - A function that suggests optimal appointment slots.
 * - OptimalAppointmentSchedulingInput - The input type for the aiOptimizedAppointmentScheduling function.
 * - OptimalAppointmentSchedulingOutput - The return type for the aiOptimizedAppointmentScheduling function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema
const OptimalAppointmentSchedulingInputSchema = z.object({
  doctorScheduleDescription: z.string().describe(
    "A detailed description of the doctor's availability, including existing appointments and blocked times. Example: 'Dr. Smith is available from 9 AM to 5 PM on Monday. Existing appointments: from 10:00 to 10:30 (Patient A), from 15:00 to 16:00 (Patient B). Blocked for lunch: from 13:00 to 14:00.'"
  ),
  treatmentType: z.string().describe("The type of treatment the patient needs (e.g., 'Dental Cleaning', 'Filling', 'Crown')."),
  requiredDurationMinutes: z.number().int().positive().describe("The estimated duration of the treatment in minutes."),
  patientPreferences: z.string().optional().describe("Any specific preferences the patient might have (e.g., 'prefers morning appointments', 'needs to finish by 3 PM')."),
  clinicOperatingHours: z.string().describe("The overall operating hours of the clinic for the day or period being considered. Example: 'Monday to Friday, 8 AM to 6 PM.'"),
});

export type OptimalAppointmentSchedulingInput = z.infer<typeof OptimalAppointmentSchedulingInputSchema>;

// Output Schema
const OptimalAppointmentSchedulingOutputSchema = z.object({
  suggestedSlots: z.array(z.object({
    startTime: z.string().describe("The start time of the suggested appointment slot in HH:MM format (e.g., '09:00', '14:30')."),
    endTime: z.string().describe("The end time of the suggested appointment slot in HH:MM format (e.g., '10:00', '15:00')."),
    reason: z.string().optional().describe("A brief explanation for why this slot is suggested (e.g., 'Fits perfectly between existing appointments', 'Minimizes idle time')."),
  })).describe("A list of optimal appointment slots suggested by the AI."),
  optimizationNotes: z.string().describe("A brief explanation of why these slots were chosen, how they optimize the schedule, and how they address the patient's preferences or other constraints."),
});

export type OptimalAppointmentSchedulingOutput = z.infer<typeof OptimalAppointmentSchedulingOutputSchema>;

export async function aiOptimizedAppointmentScheduling(input: OptimalAppointmentSchedulingInput): Promise<OptimalAppointmentSchedulingOutput> {
  return aiOptimizedAppointmentSchedulingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeAppointmentPrompt',
  input: { schema: OptimalAppointmentSchedulingInputSchema },
  output: { schema: OptimalAppointmentSchedulingOutputSchema },
  prompt: `You are an intelligent AI assistant specialized in optimizing dental clinic schedules. Your goal is to suggest the most efficient appointment slots for patients, minimizing doctor idle time and ensuring smooth operational flow.

Here is the information you need to consider:

Doctor's Schedule and Availability: {{{doctorScheduleDescription}}}
Clinic Operating Hours: {{{clinicOperatingHours}}}
Treatment Type: {{{treatmentType}}}
Required Duration for Treatment: {{{requiredDurationMinutes}}} minutes
Patient Preferences: {{{patientPreferences}}}

Please provide up to 3 optimal appointment slots based on the doctor's availability, the required treatment duration, and patient preferences. Prioritize slots that reduce idle time or fit well into existing gaps.
If no suitable slots can be found, you should still return an empty array for 'suggestedSlots' and provide an explanation in 'optimizationNotes'.

Format your response as a JSON object matching the output schema.
`,
});

const aiOptimizedAppointmentSchedulingFlow = ai.defineFlow(
  {
    name: 'aiOptimizedAppointmentSchedulingFlow',
    inputSchema: OptimalAppointmentSchedulingInputSchema,
    outputSchema: OptimalAppointmentSchedulingOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
