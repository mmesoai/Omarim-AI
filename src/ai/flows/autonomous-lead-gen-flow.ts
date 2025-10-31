
'use server';
/**
 * @fileOverview An autonomous AI agent flow for lead generation and qualification.
 * This flow now returns the qualified leads and a summary. The actual database
 * and email actions are handled by the client via secure server actions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { findAndQualifyLeads, type QualifiedLead } from '@/ai/tools/find-and-qualify-leads';
import { googleAI } from '@genkit-ai/google-genai';

const AutonomousLeadGenInputSchema = z.object({
  objective: z.string().describe('The high-level objective for the lead generation task. e.g., "Find 5 local businesses that need a new website."'),
});
export type AutonomousLeadGenInput = z.infer<typeof AutonomousLeadGenInputSchema>;

const AutonomousLeadGenOutputSchema = z.object({
  qualifiedLeads: z.array(findAndQualifyLeads.outputSchema).describe('A list of qualified leads that match the objective.'),
  summary: z.string().describe('A summary of the actions taken and the results.'),
});
export type AutonomousLeadGenOutput = z.infer<typeof AutonomousLeadGenOutputSchema>;

export async function autonomousLeadGen(input: AutonomousLeadGenInput): Promise<AutonomousLeadGenOutput> {
  return autonomousLeadGenFlow(input);
}

const parameterExtractionPrompt = ai.definePrompt({
    name: 'parameterExtractionPrompt',
    input: { schema: z.object({ objective: z.string() }) },
    output: { schema: findAndQualifyLeads.inputSchema },
    model: googleAI('gemini-pro'),
    system: `You are an AI assistant. Your task is to extract the parameters for the 'findAndQualifyLeads' tool from a user's high-level objective.

The tool has the following input schema:
- count: The desired number of qualified leads to find.
- leadQuery: A query describing the type of leads to look for.

From the user's objective, determine the 'count' and the 'leadQuery'.

User's Objective: {{{objective}}}
`,
});

const autonomousLeadGenFlow = ai.defineFlow(
  {
    name: 'autonomousLeadGenFlow',
    inputSchema: AutonomousLeadGenInputSchema,
    outputSchema: AutonomousLeadGenOutputSchema,
  },
  async ({ objective }) => {
    const { output: toolParams } = await parameterExtractionPrompt({ objective });

    if (!toolParams) {
        throw new Error("The AI agent failed to determine the parameters for the lead generation tool.");
    }
    
    const leads = await findAndQualifyLeads(toolParams);

    if (!leads || leads.length === 0) {
        return {
            qualifiedLeads: [],
            summary: "I searched for leads matching your objective but did not find any. You may want to try rephrasing your objective.",
        }
    }
    
    return {
      qualifiedLeads: leads,
      summary: `I have analyzed the request and identified ${leads.length} potential leads. You can now choose to engage them.`,
    };
  }
);
