
'use server';
/**
 * @fileOverview A Genkit flow to generate marketing assets for any given feature.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { generateMultipleSocialPosts, type GenerateMultipleSocialPostsOutput } from '@/ai/flows/generate-multiple-social-posts';


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

export const GenerateFeatureMarketingAssetsOutputSchema = z.object({
  landingPage: LandingPageSchema,
  socialPosts: generateMultipleSocialPosts.outputSchema.shape.posts,
});
export type GenerateFeatureMarketingAssetsOutput = z.infer<typeof GenerateFeatureMarketingAssetsOutputSchema>;

export async function generateFeatureMarketingAssets(input: GenerateFeatureMarketingAssetsInput): Promise<GenerateFeatureMarketingAssetsOutput> {
  return generateFeatureMarketingAssetsFlow(input);
}

const generateLandingPagePrompt = ai.definePrompt({
    name: 'generateFeatureLandingPagePrompt',
    input: { schema: GenerateFeatureMarketingAssetsInputSchema },
    output: { schema: LandingPageSchema },
    model: googleAI('gemini-pro'),
    prompt: `You are a world-class digital marketing strategist. Your task is to generate compelling landing page content to sell a specific feature as a standalone product.

Feature Details:
- Name: {{{featureName}}}
- Description: {{{featureDescription}}}
- Price: {{{price}}}

You must generate:
- A powerful, attention-grabbing headline.
- Compelling body copy that explains the problem, presents the feature as the solution, and ends with a strong call to action to purchase at the specified price.

Generate the content in the specified JSON format.
`,
});


export const generateFeatureMarketingAssetsFlow = ai.defineFlow(
  {
    name: 'generateFeatureMarketingAssetsFlow',
    inputSchema: GenerateFeatureMarketingAssetsInputSchema,
    outputSchema: GenerateFeatureMarketingAssetsOutputSchema,
  },
  async (input) => {
    // Generate landing page and social posts in parallel
    const [landingPageResponse, socialPostsResponse] = await Promise.all([
        generateLandingPagePrompt(input),
        generateMultipleSocialPosts({
            topicOrContent: `Announcing our new service: ${input.featureName}. ${input.featureDescription} available now for ${input.price}.`,
        }),
    ]);
    
    const landingPage = landingPageResponse.output;

    if (!landingPage) {
        throw new Error("Failed to generate landing page content.");
    }
    
    if (!socialPostsResponse) {
        throw new Error("Failed to generate social media posts.");
    }

    return {
      landingPage,
      socialPosts: socialPostsResponse.posts,
    };
  }
);
