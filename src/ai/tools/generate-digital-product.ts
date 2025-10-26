
'use server';
/**
 * @fileOverview A Genkit tool for generating the content of a digital product.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { TrendingDigitalProduct } from './find-trending-digital-product';

export const GeneratedProductContentSchema = z.object({
    title: z.string().describe("The final title of the digital product."),
    content: z.string().describe("The main content of the digital product. If it's an eBook, this is the full text. If it's a course, this is the detailed outline and key scripts. If it's a template, this is the descriptive guide on how to use it."),
});
export type GeneratedProductContent = z.infer<typeof GeneratedProductContentSchema>;

const GenerateDigitalProductInputSchema = z.object({
    productIdea: z.custom<TrendingDigitalProduct>(),
});

const generateDigitalProductPrompt = ai.definePrompt({
  name: 'generateDigitalProductPrompt',
  input: { schema: GenerateDigitalProductInputSchema },
  output: { schema: GeneratedProductContentSchema },
  prompt: `You are an expert content creator and product developer.
Your task is to generate the actual content for the following digital product idea.

Product Idea Details:
- Name: {{{productIdea.productName}}}
- Type: {{{productIdea.productType}}}
- Description: {{{productIdea.description}}}
- Target Audience: {{{productIdea.targetAudience}}}

Based on the product type, generate the complete content:
- If it's an eBook: Write a comprehensive, well-structured book of at least 1,000 words with a title, introduction, several chapters, and a conclusion.
- If it's a Video Course: Create a detailed curriculum with modules, lesson titles, and a script for the introduction video.
- If it's a Notion Template: Describe the template's structure in detail and write a comprehensive guide on how to use it effectively.
- If it's a Software Tool: Write the high-level feature specification and a compelling landing page copy.

The output must be a complete, ready-to-use piece of content.

Return the result in the specified JSON format.
`,
});

export const generateDigitalProduct = ai.defineTool(
  {
    name: 'generateDigitalProduct',
    description: 'Generates the full content for a given digital product idea (e.g., writes an eBook, creates a course outline).',
    inputSchema: GenerateDigitalProductInputSchema,
    outputSchema: GeneratedProductContentSchema,
  },
  async ({ productIdea }) => {
    const { output } = await generateDigitalProductPrompt({ productIdea });
    
    if (!output) {
      throw new Error("Failed to generate the digital product content.");
    }

    return output;
  }
);
