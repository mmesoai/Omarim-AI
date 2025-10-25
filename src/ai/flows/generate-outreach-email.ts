'use server';
/**
 * @fileOverview Generates a personalized outreach email based on a LinkedIn profile.
 *
 * - generateOutreachEmail - A function that scrapes a LinkedIn profile and generates an email.
 * - GenerateOutreachEmailInput - The input type for the generateOutreachEmail function.
 * - GenerateOutreachEmailOutput - The return type for the generateOutreachEmail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateOutreachEmailInputSchema = z.object({
  linkedInUrl: z.string().url().describe('The URL of the LinkedIn profile to scrape.'),
});
export type GenerateOutreachEmailInput = z.infer<typeof GenerateOutreachEmailInputSchema>;

const GenerateOutreachEmailOutputSchema = z.object({
  subject: z.string().describe('The subject line of the generated email.'),
  body: z.string().describe('The body of the generated email.'),
});
export type GenerateOutreachEmailOutput = z.infer<typeof GenerateOutreachEmailOutputSchema>;

export async function generateOutreachEmail(input: GenerateOutreachEmailInput): Promise<GenerateOutreachEmailOutput> {
  return generateOutreachEmailFlow(input);
}

const generateOutreachEmailPrompt = ai.definePrompt({
  name: 'generateOutreachEmailPrompt',
  input: { schema: GenerateOutreachEmailInputSchema },
  output: { schema: GenerateOutreachEmailOutputSchema },
  prompt: `You are an expert sales development representative.
You will be given a LinkedIn profile URL. Your task is to generate a compelling and personalized outreach email to pitch OmarimAI's services.

Here is the LinkedIn URL: {{{linkedInUrl}}}

Assume you have already scraped the profile and have the following (hypothetical) information:
- Name: [Assume a name from the profile]
- Role: [Assume a role from the profile]
- Company: [Assume a company from the profile]
- Recent Activity: [Assume some recent activity or posts]

Based on this information, write a personalized email. The email should be concise, professional, and highlight how OmarimAI can solve a potential problem for their company.
Start the email by addressing the person by their assumed name.
Reference their role, company, or recent activity to show you've done your research.
End with a clear call to action.

Generate a subject line and a body for the email.`,
});

const generateOutreachEmailFlow = ai.defineFlow(
  {
    name: 'generateOutreachEmailFlow',
    inputSchema: GenerateOutreachEmailInputSchema,
    outputSchema: GenerateOutreachEmailOutputSchema,
  },
  async (input) => {
    const { output } = await generateOutreachEmailPrompt(input);
    return output!;
  }
);
