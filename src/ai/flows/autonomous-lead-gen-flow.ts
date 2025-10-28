
'use server';
/**
 * @fileOverview An autonomous AI agent flow for lead generation and qualification.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { findAndQualifyLeads } from '@/ai/tools/find-and-qualify-leads';
import type { QualifiedLead } from '@/ai/tools/find-and-qualify-leads';
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

const autonomousLeadGenPrompt = ai.definePrompt({
  name: 'autonomousLeadGenPrompt',
  input: { schema: AutonomousLeadGenInputSchema },
  // The output should be the direct result of the tool call, which is an array of leads.
  output: { schema: z.array(findAndQualifyLeads.outputSchema) },
  tools: [findAndQualifyLeads],
  model: googleAI('gemini-pro'),
  system: `You are an autonomous business development agent.
Your goal is to find and qualify leads based on a high-level objective.
You MUST use the findAndQualifyLeads tool to achieve this.
Your final output should be ONLY the direct result from the tool call. Do not wrap it in any other object.

Objective: {{{objective}}}
`,
});

const autonomousLeadGenFlow = ai.defineFlow(
  {
    name: 'autonomousLeadGenFlow',
    inputSchema: AutonomousLeadGenInputSchema,
    outputSchema: AutonomousLeadGenOutputSchema,
  },
  async (input) => {
    // The prompt now directly returns the array of leads from the tool call.
    const llmResponse = await autonomousLeadGenPrompt(input);
    
    // The structured output is now the array itself.
    const leads = (llmResponse.output || []) as QualifiedLead[];
    
    return {
      qualifiedLeads: leads,
      summary: `I have analyzed the request and identified ${leads.length} potential leads. Each has been qualified based on their role and the potential need for AI-powered web services.`,
    };
  }
);
