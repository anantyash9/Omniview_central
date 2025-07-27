
'use server';

/**
 * @fileOverview A flow for finding a lost object within video camera frames.
 *
 * - findObjectInStreams - A function that searches for an object in video frames.
 * - FindObjectInput - The input type for the function.
 * - FindObjectOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CameraFeedSchema = z.object({
    cameraName: z.string(),
    frameDataUri: z.string().describe("A single frame from the camera, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});

const FindObjectInputSchema = z.object({
  objectImageDataUri: z
    .string()
    .describe(
      "The image of the lost object, as a data URI that must include a MIME type and use Base64 encoding."
    ),
  cameraFeeds: z.array(CameraFeedSchema).describe('An array of frames, one from each camera feed, to search within.'),
});
export type FindObjectInput = z.infer<typeof FindObjectInputSchema>;

const FindingSchema = z.object({
    cameraName: z.string().describe('The name of the camera where the object was found.'),
    frameDataUri: z.string().describe('The specific frame in which the object was found, as a data URI.'),
    reasoning: z.string().describe('A brief explanation of why the AI identified the object in this frame.'),
});

const FindObjectOutputSchema = z.object({
  findings: z.array(FindingSchema).describe('A list of all instances where the lost object was found.'),
});
export type FindObjectOutput = z.infer<typeof FindObjectOutputSchema>;

export async function findObjectInStreams(
  input: FindObjectInput
): Promise<FindObjectOutput> {
  return findObjectInStreamsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findObjectInStreamsPrompt',
  input: { schema: FindObjectInputSchema },
  output: { schema: FindObjectOutputSchema },
  prompt: `You are a security AI that helps find lost items by searching through camera footage.

You will be given an image of a lost object and a set of image frames, each from a different camera. Your task is to carefully examine each frame to see if the lost object is present.

The lost object is:
{{media url=objectImageDataUri}}

Search for this object in the following camera frames:
{{#each cameraFeeds}}
- Camera: {{{cameraName}}}
  Frame: {{media url=frameDataUri}}
{{/each}}

Analyze each frame. If you find the object, create a "finding" entry with the camera's name, the frame it was in, and a brief reasoning. If you find it in multiple frames, create an entry for each one. If you do not find the object in any frames, return an empty array for "findings".
`,
});

const findObjectInStreamsFlow = ai.defineFlow(
  {
    name: 'findObjectInStreamsFlow',
    inputSchema: FindObjectInputSchema,
    outputSchema: FindObjectOutputSchema,
  },
  async (input) => {
    // Handle cases where the input might be missing critical data.
    if (!input.objectImageDataUri || input.cameraFeeds.length === 0) {
        return { findings: [] };
    }
    const { output } = await prompt(input);
    return output!;
  }
);
