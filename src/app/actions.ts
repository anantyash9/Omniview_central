'use server';

import { generateIncidentSuggestions as generate } from '@/ai/flows/generate-incident-suggestions';
import type { GenerateIncidentSuggestionsInput, GenerateIncidentSuggestionsOutput } from '@/ai/flows/generate-incident-suggestions';
import { generateCommanderBrief as generateBrief } from '@/ai/flows/generate-commander-brief';
import type { GenerateCommanderBriefInput, GenerateCommanderBriefOutput } from '@/ai/flows/generate-commander-brief';
import { summarizeSocialMedia as summarize } from '@/ai/flows/summarize-social-media';
import type { SummarizeSocialMediaInput, SummarizeSocialMediaOutput } from '@/ai/flows/summarize-social-media';
import { findObjectInStreams as findObject } from '@/ai/flows/find-object-in-streams';
import type { FindObjectInput, FindObjectOutput } from '@/ai/flows/find-object-in-streams';

export async function generateIncidentSuggestions(input: GenerateIncidentSuggestionsInput): Promise<GenerateIncidentSuggestionsOutput | { error: string }> {
  try {
    const output = await generate(input);
    return output;
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'An unexpected error occurred.' };
  }
}

export async function generateCommanderBrief(input: GenerateCommanderBriefInput): Promise<GenerateCommanderBriefOutput | { error: string }> {
  try {
    const output = await generateBrief(input);
    return output;
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'An unexpected error occurred.' };
  }
}

export async function summarizeSocialMedia(input: SummarizeSocialMediaInput): Promise<SummarizeSocialMediaOutput | { error: string }> {
    try {
        const output = await summarize(input);
        return output;
    } catch (e: any) {
        console.error(e);
        return { error: e.message || 'An unexpected error occurred.' };
    }
}

export async function findObjectInStreams(input: FindObjectInput): Promise<FindObjectOutput | { error: string }> {
    try {
        const output = await findObject(input);
        return output;
    } catch (e: any) {
        console.error(e);
        return { error: e.message || 'An unexpected error occurred.' };
    }
}

export async function getPlacePhotoReferences(query: string): Promise<string[]> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("Google Maps API Key is missing for server-side action.");
    return [];
  }

  try {
    // 1. Find Place to get place_id
    const findPlaceUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id&key=${apiKey}`;
    const findPlaceResponse = await fetch(findPlaceUrl, { cache: 'force-cache' });
    const findPlaceData = await findPlaceResponse.json();

    if (findPlaceData.status !== 'OK' || !findPlaceData.candidates || findPlaceData.candidates.length === 0) {
      console.error('Find Place API failed:', findPlaceData);
      return [];
    }
    const placeId = findPlaceData.candidates[0].place_id;

    // 2. Place Details to get photo_references
    const placeDetailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${apiKey}`;
    const placeDetailsResponse = await fetch(placeDetailsUrl, { cache: 'force-cache' });
    const placeDetailsData = await placeDetailsResponse.json();

    if (placeDetailsData.status !== 'OK' || !placeDetailsData.result.photos) {
      console.error('Place Details API failed:', placeDetailsData);
      return [];
    }

    // Return an array of photo_reference strings, limited to 10
    const photoReferences = placeDetailsData.result.photos.map((p: any) => p.photo_reference);
    return photoReferences.slice(0, 10);
  } catch (error) {
    console.error("Error fetching place photos:", error);
    return [];
  }
}
