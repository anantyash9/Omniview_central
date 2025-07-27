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
import { point, polygon, booleanPointInPolygon } from '@turf/turf';

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

const DensityZoneSchema = z.object({
    id: z.string(),
    name: z.string(),
    points: z.array(z.object({ lat: z.number(), lng: z.number() })),
    maxDensity: z.number(),
});

const GenerateCommanderBriefInputSchema = z.object({
  incidents: z.array(IncidentSchema).describe('A list of current incidents.'),
  units: z.array(UnitSchema).describe('A list of available and deployed units.'),
  crowdDensity: z.array(CrowdDensityPointSchema).describe('Data on crowd density across the venue.'),
  densityZones: z.array(DensityZoneSchema).describe('A list of named zones in the venue.'),
  timestamp: z.string().describe('The current timestamp for the brief.'),
  lastBrief: z.string().optional().describe('The text of the last briefing provided to the commander.'),
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
  input: {schema: z.any()}, // Allow extra fields from flow
  output: {schema: GenerateCommanderBriefOutputSchema},
  prompt: `You are an AI assistant for a security command center. Your task is to generate a concise, natural language briefing for the event commander.

  The briefing should be no more than 40 words.

  **CRITICAL INSTRUCTIONS:**
  1.  Analyze the new data provided below.
  2.  Compare it to the 'Last Briefing'.
  3.  Generate a NEW briefing that focuses on what has changed.
  4.  If nothing significant has changed, state that the situation is stable or holding steady. Avoid repeating the previous brief verbatim.

  Last Briefing:
  {{#if lastBrief}}
  "{{{lastBrief}}}"
  {{else}}
  No previous brief. Provide a summary of the initial situation.
  {{/if}}

  Current Time: {{{timestamp}}}

  Current Data:
  - Active Incidents:
    {{#each incidents}}
    - {{title}} (Severity: {{severity}}): {{description}}
    {{else}}
    - No active incidents.
    {{/each}}
  - Unit Status:
    {{#each units}}
    - {{id}} ({{type}}): {{status}}
    {{else}}
    - No units reported.
    {{/each}}
  - Contextual Crowd Density:
    {{#each contextualDensity}}
    - Density of {{density}} in {{zoneName}}.
    {{else}}
    - No significant crowd density in named zones.
    {{/each}}

  Generate a new, concise brief based on the changes from the last one.
  `,
});

const generateCommanderBriefFlow = ai.defineFlow(
  {
    name: 'generateCommanderBriefFlow',
    inputSchema: GenerateCommanderBriefInputSchema,
    outputSchema: GenerateCommanderBriefOutputSchema,
  },
  async (input) => {
    // Pre-process crowd density to map hotspots to zone names
    const contextualDensity = input.crowdDensity
      .map(densityPoint => {
        const pt = point([densityPoint.location.lng, densityPoint.location.lat]);
        for (const zone of input.densityZones) {
          if (zone.points.length >= 3) {
            const polyPoints = [...zone.points, zone.points[0]]; // Close the polygon
            const poly = polygon([polyPoints.map(p => [p.lng, p.lat])]);
            if (booleanPointInPolygon(pt, poly)) {
              return {
                zoneName: zone.name,
                density: densityPoint.density > 0.7 ? 'High' : (densityPoint.density > 0.4 ? 'Medium' : 'Low'),
              };
            }
          }
        }
        return null;
      })
      .filter(item => item !== null && item.density !== 'Low'); // Only report Medium or High density in zones

    const promptInput = {
      ...input,
      contextualDensity,
    };
    
    const {output} = await prompt(promptInput);
    return output!;
  }
);
