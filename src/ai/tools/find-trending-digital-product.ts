
'use server';
/**
 * @fileOverview A Genkit tool for identifying a trending digital product idea.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const TrendingDigitalProductSchema = z.object({
  productName: z.string().describe("The name of the trending digital product."),
  productType: z.enum(["eBook", "Notion Template", "Video Course", "Software Tool"]).describe("The type of digital product."),
  description: z.string().describe("A brief description of the product and why it's a good trend to capitalize on."),
  targetAudience: z.string().describe("The specific target audience for this digital product."),
  marketingAngle: z.string().describe("A creative marketing angle to promote this product."),
});
export type TrendingDigitalProduct = z.infer<typeof TrendingDigitalProductSchema>;

const trendingDigitalProductPrompt = ai.definePrompt({
  name: 'trendingDigitalProductPrompt',
  input: { schema: z.undefined() },
  output: { schema: TrendingDigitalProductSchema },
  prompt: `You are a digital marketing expert and trend analyst. Your task is to identify a single, highly plausible, trending digital product idea that could be created and sold online.

The product should be one of the following types: eBook, Notion Template, Video Course, or a simple Software Tool.

For this product idea, you must:
1.  Come up with a compelling name and type.
2.  Provide a description explaining why it's a valuable trend.
3.  Define the specific target audience that would be interested in this product.
4.  Create a unique and engaging marketing angle for a launch campaign.

Focus on topics that are currently popular, such as AI, productivity, content creation, or niche hobbies.

Return the single best idea in the specified JSON format.
`,
});

export const findTrendingDigitalProduct = ai.defineTool(
  {
    name: 'findTrendingDigitalProduct',
    description: 'Analyzes the market to identify a single, trending digital product idea and a strategy for it.',
    inputSchema: z.undefined(),
    outputSchema: TrendingDigitalProductSchema,
  },
  async () => {
    const { output } = await trendingDigitalProductPrompt();
    if (!output) {
      throw new Error("Failed to generate trending digital product information.");
    }
    return output;
  }
);
