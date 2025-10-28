'use server';
/**
 * @fileOverview An autonomous AI agent flow for lead generation and qualification.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { findAndQualifyLeads } from '@/ai/tools/find-and-qualify-leads';
import type { QualifiedLead } from '@/ai/tools/find-and-qualify-leads';

const AutonomousLeadGenInputSchema = z.object({
  objective: z.string().describe('The high-level objective for the lead generation task. e.g., "Find 5 local businesses that need a new website."'),
});
export type AutonomousLeadGenInput = z.infer<typeof AutonomousLeadGenInputSchema>;

const AutonomousLeadGenOutputSchema = z.object({
  qualifiedLeads: z.array(findAndQualifyLeads.outputSchema.element).describe('A list of qualified leads that match the objective.'),
  summary: z.string().describe('A summary of the actions taken and the results.'),
});
export type AutonomousLeadGenOutput = z.infer<typeof AutonomousLeadGenOutputSchema>;

export async function autonomousLeadGen(input: AutonomousLeadGenInput): Promise<AutonomousLeadGenOutput> {
  return autonomousLeadGenFlow(input);
}

// This prompt's only job is to figure out the right parameters for the findAndQualifyLeads tool.
const parameterExtractionPrompt = ai.definePrompt({
    name: 'parameterExtractionPrompt',
    input: { schema: AutonomousLeadGenInputSchema },
    output: { schema: findAndQualifyLeads.inputSchema },
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
  async (input) => {
    // Step 1: Use a simple prompt to determine the parameters for the tool.
    const { output: toolParams } = await parameterExtractionPrompt(input);

    if (!toolParams) {
        throw new Error("The AI agent failed to determine the parameters for the lead generation tool.");
    }
    
    // Step 2: Directly call the tool with the determined parameters.
    const leads = await findAndQualifyLeads(toolParams);

    // Step 3: Return the structured output.
    return {
      qualifiedLeads: leads,
      summary: `I have analyzed the request and identified ${leads.length} potential leads. Each has been qualified based on their role and the potential need for AI-powered web services.`,
    };
  }
);
