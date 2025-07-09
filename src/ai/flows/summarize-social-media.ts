'use server';

/**
 * @fileOverview A flow for analyzing and summarizing social media posts.
 *
 * - summarizeSocialMedia - A function that analyzes social media posts.
 * - SummarizeSocialMediaInput - The input type for the function.
 * - SummarizeSocialMediaOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SocialMediaPostSchema = z.object({
  id: z.string(),
  location: z.object({ lat: z.number(), lng: z.number() }),
  author: z.string(),
  text: z.string(),
});

const SummarizeSocialMediaInputSchema = z.object({
  posts: z.array(SocialMediaPostSchema).describe('A list of social media posts from the event.'),
});
export type SummarizeSocialMediaInput = z.infer<typeof SummarizeSocialMediaInputSchema>;

const TrendingTopicSchema = z.object({
  topic: z.string().describe('A short title for the trending topic (e.g., "Long Queues", "Positive Atmosphere").'),
  sentiment: z.enum(['Positive', 'Neutral', 'Negative']).describe('The sentiment of this specific topic.'),
  summary: z.string().describe('A one or two sentence summary of the posts related to this topic.'),
  postCount: z.number().describe('The number of posts related to this topic.'),
  representativePost: z.string().describe('The text from one of the most representative posts for this topic.'),
});

const SummarizeSocialMediaOutputSchema = z.object({
  overallSentiment: z.enum(['Positive', 'Mixed', 'Neutral', 'Negative']).describe('The overall sentiment of all social media posts combined.'),
  trendingTopics: z.array(TrendingTopicSchema).describe('A list of trending topics identified from the posts. Group similar posts together.'),
});
export type SummarizeSocialMediaOutput = z.infer<typeof SummarizeSocialMediaOutputSchema>;

export async function summarizeSocialMedia(
  input: SummarizeSocialMediaInput
): Promise<SummarizeSocialMediaOutput> {
  return summarizeSocialMediaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeSocialMediaPrompt',
  input: { schema: SummarizeSocialMediaInputSchema },
  output: { schema: SummarizeSocialMediaOutputSchema },
  prompt: `You are a social media intelligence analyst for a large event. Your job is to analyze geotagged social media posts from attendees to identify trends, sentiment, and potential issues.

  Review the following posts and provide a summary.

  Posts:
  {{#each posts}}
  - ({{author}}): "{{text}}"
  {{else}}
  - No posts to analyze.
  {{/each}}

  Your task:
  1. Determine the 'overallSentiment' of all posts combined. It can be Positive, Negative, Mixed, or Neutral.
  2. Identify key 'trendingTopics'. Group posts discussing the same issue (e.g., long lines, good music, expensive food) into a single topic.
  3. For each topic, provide a 'topic' title, the 'sentiment', a concise 'summary' of what people are saying, the 'postCount', and the text of a 'representativePost'.
  4. If there are no posts, return an empty list of topics and a Neutral sentiment.
  `,
});

const summarizeSocialMediaFlow = ai.defineFlow(
  {
    name: 'summarizeSocialMediaFlow',
    inputSchema: SummarizeSocialMediaInputSchema,
    outputSchema: SummarizeSocialMediaOutputSchema,
  },
  async input => {
    if (input.posts.length === 0) {
        return {
            overallSentiment: 'Neutral',
            trendingTopics: [],
        };
    }
    const { output } = await prompt(input);
    return output!;
  }
);
