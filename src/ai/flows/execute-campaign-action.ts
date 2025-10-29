
'use server';
/**
 * @fileOverview Executes a campaign action using natural language commands.
 * This flow interprets a command, uses tools to interact with the database,
 * and performs actions like adding leads to an outreach sequence.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { manageOutreachSequence } from '@/ai/tools/manage-outreach-sequence';
import { addLeadsToSequence } from '@/services/firestore-service';
import { googleAI } from '@genkit-ai/google-genai';

const ExecuteCampaignActionInputSchema = z.object({
  command: z.string().describe('The natural language command for the campaign action, e.g., "Add new leads to the welcome sequence."'),
  userId: z.string().describe('The ID of the user performing the action.'),
});
export type ExecuteCampaignActionInput = z.infer<typeof ExecuteCampaignActionInputSchema>;

const ExecuteCampaignActionOutputSchema = z.object({
  result: z.string().describe('A summary of the result of the campaign action.'),
});
export type ExecuteCampaignActionOutput = z.infer<typeof ExecuteCampaignActionOutputSchema>;

export async function executeCampaignAction(input: ExecuteCampaignActionInput): Promise<ExecuteCampaignActionOutput> {
  return executeCampaignActionFlow(input);
}

const executeCampaignActionPrompt = ai.definePrompt({
  name: 'executeCampaignActionPrompt',
  input: { schema: ExecuteCampaignActionInputSchema },
  // The output is just the tool's input schema. The LLM's job is to figure out the parameters.
  output: { schema: manageOutreachSequence.inputSchema },
  tools: [manageOutreachSequence],
  model: googleAI('gemini-pro'),
  system: `You are an AI assistant that manages marketing campaigns.
You will be given a command from a user.
Your task is to determine the correct parameters for the 'manageOutreachSequence' tool based on the user's command.
Do not call the tool. Simply output the parameters it would need.

User Command: {{{command}}}

Analyze the command and determine the 'sequenceName' and 'leadStatus' parameters.`,
});


const executeCampaignActionFlow = ai.defineFlow(
  {
    name: 'executeCampaignActionFlow',
    inputSchema: ExecuteCampaignActionInputSchema,
    outputSchema: ExecuteCampaignActionOutputSchema,
  },
  async ({ command, userId }) => {
    // Step 1: Use the LLM to figure out the parameters from the natural language command.
    const { output: toolParams } = await executeCampaignActionPrompt({ command, userId });

    if (!toolParams) {
        throw new Error("Could not determine the parameters for the campaign action.");
    }
    
    // Step 2: Call the actual, secure client-side database function with the determined parameters.
    const result = await addLeadsToSequence({
        userId,
        sequenceName: toolParams.sequenceName,
        leadStatus: toolParams.leadStatus,
    });

    // Step 3: Return the result from the secure function to the user.
    return {
        result: result.success ? `Action completed: ${result.message}` : `Action failed: ${result.message}`,
    };
  }
);
