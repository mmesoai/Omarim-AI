
'use server';
/**
 * @fileOverview A Genkit tool for identifying trending products and potential suppliers.
 * This tool uses a generative model to create a plausible, fictional product opportunity.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TrendingProductSchema = z.object({
    productName: z.string().describe("The name of the trending product."),
    description: z.string().describe("A brief description of the product and why it's trending."),
    targetAudience: z.string().describe("The primary target audience for this product."),
    estimatedSalePrice: z.number().describe("The estimated retail price for the product."),
    supplier: z.object({
        name: z.string().describe("The name of a plausible, fictional supplier for this product."),
        contactEmail: z.string().email().describe("A plausible fictional email address for the supplier."),
    }).describe("Information about a potential supplier."),
    marketingAngle: z.string().describe("A creative marketing angle to promote this product, suitable for a social media or email campaign."),
});

export type TrendingProduct = z.infer<typeof TrendingProductSchema>;

const TrendingProductInputSchema = z.object({
  category: z.string().describe('The product category to analyze for trends (e.g., "kitchen gadgets", "pet accessories").'),
});

const trendingProductPrompt = ai.definePrompt({
  name: 'trendingProductPrompt',
  input: { schema: TrendingProductInputSchema },
  output: { schema: TrendingProductSchema },
  prompt: `You are an expert e-commerce analyst with a keen eye for viral products.
Your task is to identify a single, plausible, trending product within the given category: "{{{category}}}".

For this product, you must:
1.  Provide a compelling description explaining why it's currently popular.
2.  Define the specific target audience.
3.  Estimate a reasonable sale price.
4.  Invent a plausible, fictional supplier for the product, including a name and contact email.
5.  Create a unique and engaging marketing angle to kickstart a promotional campaign.

Return the result in the specified JSON format.
`,
});


export const findTrendingProducts = ai.defineTool(
  {
    name: 'findTrendingProducts',
    description: 'Analyzes a product category to identify a single trending product, a potential supplier, and a marketing strategy.',
    inputSchema: TrendingProductInputSchema,
    outputSchema: TrendingProductSchema,
  },
  async (input) => {
    const { output } = await trendingProductPrompt(input);
    
    if (!output) {
      throw new Error("Failed to generate trending product information.");
    }

    return output;
  }
);


// Schemas for generateProductCampaign flow, moved here to avoid "use server" export issues.
export const GenerateProductCampaignInputSchema = TrendingProductSchema;
export type GenerateProductCampaignInput = TrendingProduct;

const SocialPostSchema = z.object({
    platform: z.enum(['Twitter', 'LinkedIn', 'Facebook']).describe('The target social media platform.'),
    content: z.string().describe('The generated content for the social media post, tailored to the platform.'),
    hashtags: z.array(z.string()).describe('A list of relevant hashtags for the post.'),
});

export const GenerateProductCampaignOutputSchema = z.object({
  socialPosts: z.array(SocialPostSchema).describe('A list of generated social media posts.'),
  marketingImage: z.object({
    prompt: z.string().describe('The prompt used to generate the marketing image.'),
    imageUrl: z.string().url().describe('The data URI of the generated marketing image.'),
  }),
  videoConcept: z.object({
    title: z.string().describe('A catchy title for a short promotional video (e.g., for TikTok or YouTube Shorts).'),
    sceneDescription: z.string().describe('A brief description of the scenes and actions in the video.'),
  }),
});
export type GenerateProductCampaignOutput = z.infer<typeof GenerateProductCampaignOutputSchema>;
