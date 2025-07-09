'use server';

/**
 * @fileOverview A flow for generating incident response suggestions for analysts.
 *
 * - generateIncidentSuggestions - A function that generates incident response suggestions.
 * - GenerateIncidentSuggestionsInput - The input type for the generateIncidentSuggestions function.
 * - GenerateIncidentSuggestionsOutput - The return type for the generateIncidentSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateIncidentSuggestionsInputSchema = z.object({
  incidentDescription: z
    .string()
    .describe('A description of the incident, including location, time, and involved parties.'),
  crowdDensity: z.string().describe('The current crowd density in the affected area.'),
  availableResources: z
    .string()
    .describe('A list of available resources, including personnel, equipment, and vehicles.'),
});
export type GenerateIncidentSuggestionsInput = z.infer<typeof GenerateIncidentSuggestionsInputSchema>;

const GenerateIncidentSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('A list of suggested actions to take in response to the incident.'),
  impactScores: z
    .array(z.number())
    .describe('A list of impact scores for each suggested action, indicating the potential effectiveness of the action.'),
});
export type GenerateIncidentSuggestionsOutput = z.infer<typeof GenerateIncidentSuggestionsOutputSchema>;

export async function generateIncidentSuggestions(
  input: GenerateIncidentSuggestionsInput
): Promise<GenerateIncidentSuggestionsOutput> {
  return generateIncidentSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateIncidentSuggestionsPrompt',
  input: {schema: GenerateIncidentSuggestionsInputSchema},
  output: {schema: GenerateIncidentSuggestionsOutputSchema},
  prompt: `You are an AI assistant designed to provide incident response suggestions for security analysts.

  Given the following information about an incident, generate a list of suggested actions and their potential impact scores.

  Incident Description: {{{incidentDescription}}}
  Crowd Density: {{{crowdDensity}}}
  Available Resources: {{{availableResources}}}

  Format your output as a JSON object with two fields:
  - suggestions: An array of suggested actions (strings).
  - impactScores: An array of impact scores (numbers) corresponding to each suggestion, ranging from 0 to 100.

  Example:
  {
    "suggestions": ["Open Gate A13 to reduce crowd density.", "Dispatch additional security personnel to the area."],
    "impactScores": [75, 80]
  }
  `,
});

const generateIncidentSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateIncidentSuggestionsFlow',
    inputSchema: GenerateIncidentSuggestionsInputSchema,
    outputSchema: GenerateIncidentSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
