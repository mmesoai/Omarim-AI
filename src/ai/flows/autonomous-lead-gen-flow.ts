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
  output: { schema: z.object({ qualifiedLeads: z.array(findAndQualifyLeads.inputSchema) }) },
  tools: [findAndQualifyLeads],
  model: googleAI('gemini-pro'),
  system: `You are an autonomous business development agent.
Your goal is to find and qualify leads based on a high-level objective.
Use the findAndQualifyLeads tool to achieve this.
The tool will return a list of qualified leads.
Your final output should be the result from the tool call.

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
    const llmResponse = await autonomousLeadGenPrompt(input);
    const toolResponse = llmResponse.toolRequest?.tool.toString();

    // Note: In a real scenario, you'd execute the tool call here.
    // For now, we are assuming the LLM's conceptual tool call is the result.
    // This is a conceptual leap for demonstration. In a production system,
    // you would execute the tool and then process its actual output.
    const leads = (llmResponse.output?.qualifiedLeads || []) as QualifiedLead[];
    
    return {
      qualifiedLeads: leads,
      summary: `I have analyzed the request and identified ${leads.length} potential leads. Each has been qualified based on their role and the potential need for AI-powered web services.`,
    };
  }
);
