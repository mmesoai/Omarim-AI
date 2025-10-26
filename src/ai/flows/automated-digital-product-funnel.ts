
'use server';
/**
 * @fileOverview An autonomous AI agent flow for creating and marketing a digital product.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { findTrendingDigitalProduct } from '@/ai/tools/find-trending-digital-product';
import { generateDigitalProduct } from '@/ai/tools/generate-digital-product';
import { generateMultipleSocialPosts } from '@/ai/flows/generate-multiple-social-posts';
import type { GenerateMultipleSocialPostsOutput } from '@/ai/flows/generate-multiple-social-posts';

const AutomatedDigitalProductFunnelOutputSchema = z.object({
  productIdea: findTrendingDigitalProduct.outputSchema,
  generatedContent: generateDigitalProduct.outputSchema,
  marketingCampaign: generateMultipleSocialPosts.outputSchema,
  summary: z.string().describe('A summary of the entire automated funnel process and what was created.'),
});
export type AutomatedDigitalProductFunnelOutput = z.infer<typeof AutomatedDigitalProductFunnelOutputSchema>;

export async function automatedDigitalProductFunnel(): Promise<AutomatedDigitalProductFunnelOutput> {
  return automatedDigitalProductFunnelFlow();
}

const automatedDigitalProductFunnelFlow = ai.defineFlow(
  {
    name: 'automatedDigitalProductFunnelFlow',
    inputSchema: z.undefined(),
    outputSchema: AutomatedDigitalProductFunnelOutputSchema,
  },
  async () => {
    // Step 1: Find a trending digital product idea.
    const productIdea = await findTrendingDigitalProduct();

    // Step 2: Generate the actual content for the product.
    const generatedContent = await generateDigitalProduct({ productIdea });

    // Step 3: Generate social media posts to market the new product.
    const marketingCampaign = await generateMultipleSocialPosts({
        topicOrContent: `Announcing our new digital product: "${productIdea.productName}". ${productIdea.description}`,
    });

    // Step 4: Assemble the final output and generate a summary.
    const summary = `Successfully executed the automated digital product funnel. A new trending product, "${productIdea.productName}," a ${productIdea.productType}, has been generated targeting ${productIdea.targetAudience}. A multi-platform social media campaign has also been created to drive initial sales. The product is now ready for deployment.`;

    return {
      productIdea,
      generatedContent,
      marketingCampaign,
      summary,
    };
  }
);
