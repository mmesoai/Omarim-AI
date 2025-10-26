'use server';
/**
 * @fileOverview A Genkit flow to generate new product ideas based on a given topic.
 *
 * - generateProductIdeas - A function that generates a list of product ideas.
 * - GenerateProductIdeasInput - The input type for the generateProductIdeas function.
 * - GenerateProductIdeasOutput - The return type for the generateProductIdeas function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const GenerateProductIdeasInputSchema = z.object({
  topic: z.string().describe('The topic or category for which to generate product ideas.'),
});
export type GenerateProductIdeasInput = z.infer<typeof GenerateProductIdeasInputSchema>;

const ProductIdeaSchema = z.object({
    name: z.string().describe('The name of the product.'),
    description: z.string().describe('A brief, compelling description of the product.'),
    price: z.number().describe('A suggested retail price for the product.'),
    imageId: z.string().describe(`The ID of a suitable placeholder image from the provided list. Must be one of: ${PlaceHolderImages.map(p => p.id).join(', ')}`),
});

const GenerateProductIdeasOutputSchema = z.object({
  products: z.array(ProductIdeaSchema).describe('A list of generated product ideas.'),
});
export type GenerateProductIdeasOutput = z.infer<typeof GenerateProductIdeasOutputSchema>;


export async function generateProductIdeas(input: GenerateProductIdeasInput): Promise<GenerateProductIdeasOutput> {
  return generateProductIdeasFlow(input);
}


const generateProductIdeasPrompt = ai.definePrompt({
    name: 'generateProductIdeasPrompt',
    input: { schema: GenerateProductIdeasInputSchema },
    output: { schema: GenerateProductIdeasOutputSchema },
    prompt: `You are an expert product manager and e-commerce strategist.
Your task is to generate 4 creative and plausible product ideas based on a given topic.
For each product idea, you must provide a name, a short description, a suggested price, and select the most fitting image ID from the provided list.

Available Image IDs:
${PlaceHolderImages.map(p => `- ${p.id}: ${p.description}`).join('\n')}

Topic: {{{topic}}}

Generate 4 product ideas.
`,
});

const generateProductIdeasFlow = ai.defineFlow(
  {
    name: 'generateProductIdeasFlow',
    inputSchema: GenerateProductIdeasInputSchema,
    outputSchema: GenerateProductIdeasOutputSchema,
  },
  async (input) => {
    const { output } = await generateProductIdeasPrompt(input);
    return output!;
  }
);
