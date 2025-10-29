'use server';
/**
 * @fileOverview A Genkit flow to generate marketing assets for any given feature.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const GenerateFeatureMarketingAssetsInputSchema = z.object({
  featureName: z.string().describe('The name of the feature to be marketed.'),
  featureDescription: z.string().describe('A detailed description of what the feature does and its value.'),
  price: z.string().describe('The price of the feature or service (e.g., "$499/mo").'),
});
export type GenerateFeatureMarketingAssetsInput = z.infer<typeof GenerateFeatureMarketingAssetsInputSchema>;

const LandingPageSchema = z.object({
    headline: z.string().describe("A powerful, attention-grabbing headline for the landing page."),
    body: z.string().describe("The body copy for the landing page, detailing the features, benefits, and a call to action."),
});

const SocialPostSchema = z.object({
    platform: z.enum(['Twitter', 'LinkedIn', 'Facebook']).describe('The target social media platform.'),
    content: z.string().describe('The generated content for the social media post, tailored to the platform.'),
    hashtags: z.array(z.string()).describe('A list of relevant hashtags for the post.'),
});

export const GenerateFeatureMarketingAssetsOutputSchema = z.object({
  landingPage: LandingPageSchema,
  socialPosts: z.array(SocialPostSchema),
});
export type GenerateFeatureMarketingAssetsOutput = z.infer<typeof GenerateFeatureMarketingAssetsOutputSchema>;

export async function generateFeatureMarketingAssets(input: GenerateFeatureMarketingAssetsInput): Promise<GenerateFeatureMarketingAssetsOutput> {
  return generateFeatureMarketingAssetsFlow(input);
}

const generateFeatureMarketingAssetsPrompt = ai.definePrompt({
    name: 'generateFeatureMarketingAssetsPrompt',
    input: { schema: GenerateFeatureMarketingAssetsInputSchema },
    output: { schema: GenerateFeatureMarketingAssetsOutputSchema },
    model: googleAI('gemini-pro'),
    prompt: `You are a world-class digital marketing strategist. Your task is to generate a complete set of marketing assets to sell a specific feature as a standalone product.

Feature Details:
- Name: {{{featureName}}}
- Description: {{{featureDescription}}}
- Price: {{{price}}}

You must generate the following:
1.  **Landing Page Content**: A powerful headline and compelling body copy. The copy should explain the problem, present the feature as the solution, and end with a strong call to action to purchase at the specified price.
2.  **Social Media Posts**: Create three tailored posts for Twitter, LinkedIn, and Facebook to announce and promote this new service. Each post should be adapted for the platform's audience and include relevant hashtags.

Generate all assets in the specified JSON format.
`,
});

export const generateFeatureMarketingAssetsFlow = ai.defineFlow(
  {
    name: 'generateFeatureMarketingAssetsFlow',
    inputSchema: GenerateFeatureMarketingAssetsInputSchema,
    outputSchema: GenerateFeatureMarketingAssetsOutputSchema,
  },
  async (input) => {
    const { output } = await generateFeatureMarketingAssetsPrompt(input);
    return output!;
  }
);
