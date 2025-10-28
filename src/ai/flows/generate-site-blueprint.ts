
'use server';
/**
 * @fileOverview A Genkit flow to generate a complete website blueprint from a business description.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const GenerateSiteBlueprintInputSchema = z.object({
  description: z.string().describe('A description of the business or website idea.'),
});
export type GenerateSiteBlueprintInput = z.infer<typeof GenerateSiteBlueprintInputSchema>;

const SitePageSchema = z.object({
    name: z.string().describe('The display name of the page (e.g., "About Us").'),
    slug: z.string().describe('The URL slug for the page (e.g., "/about").'),
    description: z.string().describe('A brief, one-sentence description of the page\'s purpose.'),
});

const GenerateSiteBlueprintOutputSchema = z.object({
  siteName: z.string().describe('A creative and professional name for the website.'),
  tagline: z.string().describe('A short, catchy tagline that summarizes the business\'s value proposition.'),
  domainSuggestion: z.string().describe('A suggestion for a .com domain name, without "www." or "https://".'),
  pages: z.array(SitePageSchema).describe('A list of essential pages for the website, including Home, About, Services/Products, and Contact.'),
});
export type GenerateSiteBlueprintOutput = z.infer<typeof GenerateSiteBlueprintOutputSchema>;


export async function generateSiteBlueprint(input: GenerateSiteBlueprintInput): Promise<GenerateSiteBlueprintOutput> {
  return generateSiteBlueprintFlow(input);
}

const generateSiteBlueprintPrompt = ai.definePrompt({
    name: 'generateSiteBlueprintPrompt',
    input: { schema: GenerateSiteBlueprintInputSchema },
    output: { schema: GenerateSiteBlueprintOutputSchema },
    model: googleAI('gemini-pro'),
    system: `You are an expert web strategist and branding consultant.
Your task is to take a user's business description and generate a complete, professional blueprint for their website.

Based on the user's description:
1.  **Create a Site Name:** Devise a creative and memorable name for the business/website.
2.  **Write a Tagline:** Craft a short, powerful tagline that captures the essence of the business.
3.  **Suggest a Domain:** Suggest a clean, available-sounding .com domain name based on the site name. It should be just the domain, like "example.com".
4.  **Define Site Pages:** Outline the essential pages. You must include at least 'Home', 'About', 'Contact', and a page for their primary offering (like 'Services' or 'Products'). For each page, provide a name, a URL slug, and a one-sentence description.

User's Business Description:
"{{{description}}}"

Generate the complete blueprint in the specified JSON format.
`,
});

const generateSiteBlueprintFlow = ai.defineFlow(
  {
    name: 'generateSiteBlueprintFlow',
    inputSchema: GenerateSiteBlueprintInputSchema,
    outputSchema: GenerateSiteBlueprintOutputSchema,
  },
  async (input) => {
    const { output } = await generateSiteBlueprintPrompt(input);
    return output!;
  }
);
