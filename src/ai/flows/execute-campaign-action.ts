'use server';
/**
 * @fileOverview Executes a campaign action using natural language commands.
 * This flow interprets a command, uses tools to interact with the database,
 * and performs actions like adding leads to an outreach sequence.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { manageOutreachSequence } from '@/ai/tools/manage-outreach-sequence';

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
  output: { schema: ExecuteCampaignActionOutputSchema },
  tools: [manageOutreachSequence],
  system: `You are an AI assistant that manages marketing campaigns.
You will be given a command from a user and a userId.
Your task is to use the available tools to execute the command.
The userId is required for all tool calls.
Based on the result of the tool call, formulate a concise summary to return to the user.

User Command: {{{command}}}
User ID: {{{userId}}}

Analyze the command, call the appropriate tool with the correct parameters (including the userId), and then summarize the outcome.`,
});


const executeCampaignActionFlow = ai.defineFlow(
  {
    name: 'executeCampaignActionFlow',
    inputSchema: ExecuteCampaignActionInputSchema,
    outputSchema: ExecuteCampaignActionOutputSchema,
  },
  async (input) => {
    const { output } = await executeCampaignActionPrompt(input);
    return output!;
  }
);
