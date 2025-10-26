'use server';
/**
 * @fileOverview Generates a social media post based on a given topic.
 *
 * - generateSocialMediaPost - Generates a social media post.
 * - GenerateSocialMediaPostInput - The input type for the generateSocialMediaPost function.
 * - GenerateSocialMediaPostOutput - The return type for the generateSocialMediaPost function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const GenerateSocialMediaPostInputSchema = z.object({
  topic: z.string().describe('The topic or product to generate a social media post about.'),
});
export type GenerateSocialMediaPostInput = z.infer<typeof GenerateSocialMediaPostInputSchema>;

const GenerateSocialMediaPostOutputSchema = z.object({
  postContent: z.string().describe('The generated social media post content.'),
  hashtags: z.array(z.string()).describe('A list of relevant hashtags for the post.'),
});
export type GenerateSocialMediaPostOutput = z.infer<typeof GenerateSocialMediaPostOutputSchema>;

export async function generateSocialMediaPost(input: GenerateSocialMediaPostInput): Promise<GenerateSocialMediaPostOutput> {
  return generateSocialMediaPostFlow(input);
}

const generateSocialMediaPostPrompt = ai.definePrompt({
  name: 'generateSocialMediaPostPrompt',
  input: { schema: GenerateSocialMediaPostInputSchema },
  output: { schema: GenerateSocialMediaPostOutputSchema },
  model: googleAI('gemini-pro'),
  prompt: `You are an expert social media manager.
Your task is to generate a short, engaging, and unique awareness post for social media platforms based on the provided topic.

The post should be attention-grabbing and aim to build brand awareness.
Also, provide a list of relevant hashtags.

Topic: {{{topic}}}

Generate the post content and a list of hashtags.`,
});

const generateSocialMediaPostFlow = ai.defineFlow(
  {
    name: 'generateSocialMediaPostFlow',
    inputSchema: GenerateSocialMediaPostInputSchema,
    outputSchema: GenerateSocialMediaPostOutputSchema,
  },
  async (input) => {
    const { output } = await generateSocialMediaPostPrompt(input);
    return output!;
  }
);
