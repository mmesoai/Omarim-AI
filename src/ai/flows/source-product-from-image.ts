
'use server';
/**
 * @fileOverview A Genkit flow for identifying a product from an image and generating sourcing information.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const SourceProductFromImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      'The product image as a data URI, including MIME type and Base64 encoding.'
    ),
});
export type SourceProductFromImageInput = z.infer<
  typeof SourceProductFromImageInputSchema
>;

const SourceProductFromImageOutputSchema = z.object({
  productName: z.string().describe('The identified name of the product.'),
  description: z
    .string()
    .describe(
      "A compelling product description explaining what it is and its benefits."
    ),
  targetAudience: z
    .string()
    .describe('The primary target audience for this product.'),
  estimatedSalePrice: z
    .number()
    .describe('The estimated retail price for the product.'),
  supplier: z
    .object({
      name: z
        .string()
        .describe('The name of a plausible, fictional supplier for this product.'),
      contactEmail: z
        .string()
        .email()
        .describe('A plausible fictional email address for the supplier.'),
    })
    .describe('Information about a potential supplier.'),
  marketingAngle: z
    .string()
    .describe(
      'A creative marketing angle to promote this product on social media.'
    ),
});
export type SourceProductFromImageOutput = z.infer<
  typeof SourceProductFromImageOutputSchema
>;

export async function sourceProductFromImage(
  input: SourceProductFromImageInput
): Promise<SourceProductFromImageOutput> {
  return sourceProductFromImageFlow(input);
}

const sourceProductFromImagePrompt = ai.definePrompt({
  name: 'sourceProductFromImagePrompt',
  input: { schema: SourceProductFromImageInputSchema },
  output: { schema: SourceProductFromImageOutputSchema },
  model: googleAI('gemini-pro-vision'),
  prompt: `You are an expert e-commerce souring agent.
Your task is to analyze the provided image of a product and generate a complete sourcing and marketing profile for it.

Based on the image:
1.  **Identify the Product:** Determine the exact product name.
2.  **Write a Description:** Create a compelling description for an e-commerce listing.
3.  **Define Target Audience:** Identify the ideal customer for this product.
4.  **Estimate Price:** Suggest a reasonable retail sale price.
5.  **Invent a Supplier:** Create a plausible, fictional supplier, including a company name and contact email.
6.  **Create a Marketing Angle:** Devise a unique marketing angle for a promotional campaign.

Image to Analyze:
{{media url=imageDataUri}}

Return the complete profile in the specified JSON format.
`,
});

const sourceProductFromImageFlow = ai.defineFlow(
  {
    name: 'sourceProductFromImageFlow',
    inputSchema: SourceProductFromImageInputSchema,
    outputSchema: SourceProductFromImageOutputSchema,
  },
  async (input) => {
    const { output } = await sourceProductFromImagePrompt(input);
    if (!output) {
      throw new Error('Failed to generate product information from image.');
    }
    return output;
  }
);
