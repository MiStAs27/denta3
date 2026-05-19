'use server';
/**
 * @fileOverview Una herramienta impulsada por IA que sugiere espacios óptimos para citas de pacientes.
 *
 * - aiOptimizedAppointmentScheduling - Función que sugiere espacios óptimos.
 * - OptimalAppointmentSchedulingInput - Tipo de entrada para la función.
 * - OptimalAppointmentSchedulingOutput - Tipo de retorno para la función.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Esquema de Entrada
const OptimalAppointmentSchedulingInputSchema = z.object({
  doctorScheduleDescription: z.string().describe(
    "Una descripción detallada de la disponibilidad del doctor, incluyendo citas existentes y tiempos bloqueados. Ejemplo: 'El Dr. Smith está disponible de 9 AM a 5 PM los lunes. Citas existentes: de 10:00 a 10:30 (Paciente A), de 15:00 a 16:00 (Paciente B). Bloqueado para el almuerzo: de 13:00 a 14:00.'"
  ),
  treatmentType: z.string().describe("El tipo de tratamiento que el paciente necesita (ej., 'Limpieza Dental', 'Empaste', 'Corona')."),
  requiredDurationMinutes: z.number().int().positive().describe("La duración estimada del tratamiento en minutos."),
  patientPreferences: z.string().optional().describe("Cualquier preferencia específica que el paciente pueda tener (ej., 'prefiere citas por la mañana', 'necesita terminar para las 3 PM')."),
  clinicOperatingHours: z.string().describe("El horario general de funcionamiento de la clínica para el día o periodo considerado. Ejemplo: 'Lunes a Viernes, 8 AM a 6 PM.'"),
});

export type OptimalAppointmentSchedulingInput = z.infer<typeof OptimalAppointmentSchedulingInputSchema>;

// Esquema de Salida
const OptimalAppointmentSchedulingOutputSchema = z.object({
  suggestedSlots: z.array(z.object({
    startTime: z.string().describe("La hora de inicio del espacio de cita sugerido en formato HH:MM (ej., '09:00', '14:30')."),
    endTime: z.string().describe("La hora de finalización del espacio de cita sugerido en formato HH:MM (ej., '10:00', '15:00')."),
    reason: z.string().optional().describe("Una breve explicación de por qué se sugiere este espacio (ej., 'Encaja perfectamente entre citas existentes', 'Minimiza el tiempo de inactividad')."),
  })).describe("Una lista de espacios de cita óptimos sugeridos por la IA."),
  optimizationNotes: z.string().describe("Una breve explicación de por qué se eligieron estos espacios, cómo optimizan el horario y cómo abordan las preferencias del paciente u otras restricciones."),
});

export type OptimalAppointmentSchedulingOutput = z.infer<typeof OptimalAppointmentSchedulingOutputSchema>;

export async function aiOptimizedAppointmentScheduling(input: OptimalAppointmentSchedulingInput): Promise<OptimalAppointmentSchedulingOutput> {
  return aiOptimizedAppointmentSchedulingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeAppointmentPrompt',
  input: { schema: OptimalAppointmentSchedulingInputSchema },
  output: { schema: OptimalAppointmentSchedulingOutputSchema },
  prompt: `Eres un asistente de IA inteligente especializado en optimizar los horarios de las clínicas dentales. Tu objetivo es sugerir los espacios de cita más eficientes para los pacientes, minimizando el tiempo de inactividad del doctor y asegurando un flujo operativo suave.

Aquí está la información que debes considerar:

Descripción del Horario del Doctor: {{{doctorScheduleDescription}}}
Horario de la Clínica: {{{clinicOperatingHours}}}
Tipo de Tratamiento: {{{treatmentType}}}
Duración Requerida: {{{requiredDurationMinutes}}} minutos
Preferencias del Paciente: {{{patientPreferences}}}

Por favor, proporciona hasta 3 espacios de cita óptimos basados en la disponibilidad del doctor, la duración requerida del tratamiento y las preferencias del paciente. Prioriza los espacios que reducen el tiempo muerto o encajan bien en los huecos existentes.
Si no se pueden encontrar espacios adecuados, debes devolver una matriz vacía para 'suggestedSlots' y proporcionar una explicación en 'optimizationNotes'.

Formatea tu respuesta como un objeto JSON que coincida con el esquema de salida.
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
