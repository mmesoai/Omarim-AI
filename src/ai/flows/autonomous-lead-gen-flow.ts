
'use server';
/**
 * @fileOverview An autonomous AI agent flow for lead generation and qualification.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { findAndQualifyLeads, type QualifiedLead } from '@/ai/tools/find-and-qualify-leads';
import { initiateOutreach } from './initiate-outreach-flow';
import type { InitiateOutreachOutput } from './initiate-outreach-flow';

const AutonomousLeadGenInputSchema = z.object({
  objective: z.string().describe('The high-level objective for the lead generation task. e.g., "Find 5 local businesses that need a new website."'),
  userId: z.string().describe('The user ID to associate the leads with.'),
});
export type AutonomousLeadGenInput = z.infer<typeof AutonomousLeadGenInputSchema>;

const AutonomousLeadGenResultSchema = initiateOutreach.outputSchema.extend({
    lead: findAndQualifyLeads.outputSchema.element,
});

const AutonomousLeadGenOutputSchema = z.object({
  results: z.array(AutonomousLeadGenResultSchema).describe('An array of results from the outreach initiation for each lead.'),
  summary: z.string().describe('A summary of the actions taken and the results.'),
});
export type AutonomousLeadGenOutput = z.infer<typeof AutonomousLeadGenOutputSchema>;

export async function autonomousLeadGen(input: AutonomousLeadGenInput): Promise<AutonomousLeadGenOutput> {
  return autonomousLeadGenFlow(input);
}

// This prompt's only job is to figure out the right parameters for the findAndQualifyLeads tool.
const parameterExtractionPrompt = ai.definePrompt({
    name: 'parameterExtractionPrompt',
    input: { schema: z.object({ objective: z.string() }) },
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
  async ({ objective, userId }) => {
    // Step 1: Use a simple prompt to determine the parameters for the tool.
    const { output: toolParams } = await parameterExtractionPrompt({ objective });

    if (!toolParams) {
        throw new Error("The AI agent failed to determine the parameters for the lead generation tool.");
    }
    
    // Step 2: Directly call the tool with the determined parameters to get the list of leads.
    const leads = await findAndQualifyLeads(toolParams);

    if (!leads || leads.length === 0) {
        return {
            results: [],
            summary: "I searched for leads matching your objective but did not find any. You may want to try rephrasing your objective.",
        }
    }
    
    // Step 3: For each lead, initiate the outreach process (save to DB, send email).
    const outreachPromises = leads.map(async (lead) => {
        const result = await initiateOutreach({ lead, userId });
        return { ...result, lead }; // Combine outreach result with the original lead data
    });

    const results = await Promise.all(outreachPromises);

    // Step 4: Return the structured output.
    const successfulEngagements = results.filter(r => r.emailSent).length;
    
    return {
      results,
      summary: `I have finished the autonomous lead generation task. I identified ${leads.length} potential leads and successfully engaged with ${successfulEngagements} of them. They have been added to your lead pipeline.`,
    };
  }
);
