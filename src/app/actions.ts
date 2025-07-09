'use server';

import { generateIncidentSuggestions as generate } from '@/ai/flows/generate-incident-suggestions';
import type { GenerateIncidentSuggestionsInput, GenerateIncidentSuggestionsOutput } from '@/ai/flows/generate-incident-suggestions';

export async function generateIncidentSuggestions(input: GenerateIncidentSuggestionsInput): Promise<GenerateIncidentSuggestionsOutput | { error: string }> {
  try {
    const output = await generate(input);
    return output;
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'An unexpected error occurred.' };
  }
}
