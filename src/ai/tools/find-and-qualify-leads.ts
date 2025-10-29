
/**
 * @fileOverview A Genkit tool for finding and qualifying leads from various sources.
 * This tool uses a generative model to create plausible, fictional leads in real-time.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const QualifiedLeadSchema = z.object({
    company: z.string().describe("The name of the lead's company."),
    name: z.string().describe("The full name of the lead."),
    title: z.string().describe("The job title of the lead (e.g., CEO, Founder, Director)."),
    industry: z.string().describe("The industry the company operates in."),
    email: z.string().email().describe("The plausible fictional email address of the lead."),
    qualificationReason: z.string().describe("The reason this lead is a good prospect, specifically why they would need an AI-powered website or application."),
    hasWebsite: z.boolean().describe("Whether the company currently has a website."),
});

export type QualifiedLead = z.infer<typeof QualifiedLeadSchema>;

const LeadGenerationInputSchema = z.object({
  count: z.number().describe('The desired number of qualified leads to find.'),
  leadQuery: z.string().describe('A query describing the type of leads to look for, e.g., "local businesses", "tech startups".'),
});

const leadGenerationPrompt = ai.definePrompt({
  name: 'leadGenerationPrompt',
  input: { schema: LeadGenerationInputSchema },
  output: { schema: z.array(QualifiedLeadSchema) }, // Corrected: Output is a direct array
  model: googleAI('gemini-pro'),
  prompt: `You are an expert business development researcher. Your task is to generate a list of {{{count}}} plausible, yet fictional, business leads that match the following query: "{{{leadQuery}}}".

For each lead, you must:
1.  Identify a decision-maker (e.g., CEO, Founder, Owner, Director).
2.  Determine if the fictional company likely has a website or not. For smaller, local businesses (e.g., landscapers, bakeries), it's more plausible they might not have one. For tech companies, it's almost certain they do.
3.  Based on their industry and website status, provide a compelling "qualificationReason" explaining why they would be a good prospect for an AI-powered website or application.
    - If they have no website, the reason should focus on establishing an online presence.
    - If they have a website, the reason should focus on upgrading it with AI features like chatbots, personalization, or automation to gain a competitive edge.
4.  Generate a plausible, fictional email address for the lead.

Return the list of leads as a direct JSON array, without any wrapper object.
`,
});


export const findAndQualifyLeads = ai.defineTool(
  {
    name: 'findAndQualifyLeads',
    description: 'Finds and qualifies new business leads based on a given objective. It uses AI to generate plausible, fictional leads and assesses their need for AI-powered web services.',
    inputSchema: LeadGenerationInputSchema,
    outputSchema: z.array(QualifiedLeadSchema),
  },
  async (input) => {
    const { output } = await leadGenerationPrompt(input);
    
    // The output is now correctly typed as QualifiedLead[] | undefined
    // Return the output directly, or an empty array as a fallback.
    return output || [];
  }
);
