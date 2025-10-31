
'use server';
/**
 * @fileOverview An autonomous AI agent flow for creating and marketing an AI Calling Service.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { generateFeatureMarketingAssets } from '@/ai/flows/generate-feature-marketing-assets';
import type { GenerateFeatureMarketingAssetsOutput } from '@/ai/flows/generate-feature-marketing-assets';

const AutomatedAiCallingServiceFunnelOutputSchema = z.object({
  marketingAssets: generateFeatureMarketingAssets.outputSchema,
  summary: z.string().describe('A summary of the entire automated funnel process and what was created.'),
});
export type AutomatedAiCallingServiceFunnelOutput = z.infer<typeof AutomatedAiCallingServiceFunnelOutputSchema>;

export async function automatedAiCallingServiceFunnel(): Promise<AutomatedAiCallingServiceFunnelOutput> {
  return automatedAiCallingServiceFunnelFlow();
}

const automatedAiCallingServiceFunnelFlow = ai.defineFlow(
  {
    name: 'automatedAiCallingServiceFunnelFlow',
    inputSchema: z.undefined(),
    outputSchema: AutomatedAiCallingServiceFunnelOutputSchema,
  },
  async () => {
    const featureDetails = {
        featureName: "AI-Powered Customer Call Agent",
        featureDescription: "A fully autonomous AI agent that can understand your business from a technical blueprint and handle inbound customer service calls, providing accurate answers and support 24/7.",
        price: "$999/mo",
    };

    // Step 1: Generate marketing assets for the AI Calling Service.
    const marketingAssets = await generateFeatureMarketingAssets(featureDetails);

    // Step 2: Assemble the final output and generate a summary.
    const summary = `Successfully executed the automated funnel for the AI Calling Service. A dedicated landing page and a multi-platform social media campaign have been generated to attract customers for this new service offering.`;

    return {
      marketingAssets,
      summary,
    };
  }
);
