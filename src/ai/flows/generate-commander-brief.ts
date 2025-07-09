'use server';

/**
 * @fileOverview A flow for generating a concise commander briefing.
 *
 * - generateCommanderBrief - A function that generates a summary brief.
 * - GenerateCommanderBriefInput - The input type for the function.
 * - GenerateCommanderBriefOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IncidentSchema = z.object({
  id: z.string(),
  title: z.string(),
  severity: z.enum(["Critical", "High", "Medium", "Low"]),
  location: z.object({ lat: z.number(), lng: z.number() }),
  time: z.string(),
  description: z.string(),
});

const UnitSchema = z.object({
    id: z.string(),
    type: z.enum(["Personnel", "Vehicle", "Drone"]),
    status: z.enum(["Available", "Deployed", "On-Site"]),
    location: z.object({ lat: z.number(), lng: z.number() }),
});

const CrowdDensityPointSchema = z.object({
    location: z.object({ lat: z.number(), lng: z.number() }),
    density: z.number(),
});


const GenerateCommanderBriefInputSchema = z.object({
  incidents: z.array(IncidentSchema).describe('A list of current incidents.'),
  units: z.array(UnitSchema).describe('A list of available and deployed units.'),
  crowdDensity: z.array(CrowdDensityPointSchema).describe('Data on crowd density across the venue.'),
  timestamp: z.string().describe('The current timestamp for the brief.')
});
export type GenerateCommanderBriefInput = z.infer<typeof GenerateCommanderBriefInputSchema>;

const GenerateCommanderBriefOutputSchema = z.object({
  brief: z.string().describe('A concise summary of the situation, no more than 40 words.'),
  timestamp: z.string().describe('The timestamp of the brief.'),
});
export type GenerateCommanderBriefOutput = z.infer<typeof GenerateCommanderBriefOutputSchema>;

export async function generateCommanderBrief(
  input: GenerateCommanderBriefInput
): Promise<GenerateCommanderBriefOutput> {
  return generateCommanderBriefFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCommanderBriefPrompt',
  input: {schema: GenerateCommanderBriefInputSchema},
  output: {schema: GenerateCommanderBriefOutputSchema},
  prompt: `You are an AI assistant for a security command center. Your task is to generate a concise, natural language briefing for the event commander.

  The briefing should be no more than 40 words.

  Synthesize the following information into a summary of the current situation. Focus on the most critical information, such as high-severity incidents, unit deployment status, and significant crowd density changes.

  Current Time: {{{timestamp}}}

  Active Incidents:
  {{#each incidents}}
  - {{title}} (Severity: {{severity}}): {{description}}
  {{else}}
  - No active incidents.
  {{/each}}

  Unit Status:
  {{#each units}}
  - {{id}} ({{type}}): {{status}}
  {{else}}
  - No units reported.
  {{/each}}

  Crowd Density:
  {{#each crowdDensity}}
  - Density of {{density}} at lat:{{location.lat}}, lng:{{location.lng}}.
  {{else}}
  - No crowd density data.
  {{/each}}

  Generate a brief summary based on this data.
  `,
});

const generateCommanderBriefFlow = ai.defineFlow(
  {
    name: 'generateCommanderBriefFlow',
    inputSchema: GenerateCommanderBriefInputSchema,
    outputSchema: GenerateCommanderBriefOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
