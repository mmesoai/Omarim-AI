'use server';
/**
 * @fileOverview Interprets a user's natural language command and maps it to a specific action and parameters.
 *
 * - interpretCommand - A function that interprets user commands.
 * - InterpretCommandInput - The input type for the interpretCommand function.
 * - InterpretCommandOutput - The return type for the interpretCommand function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const InterpretCommandInputSchema = z.object({
  command: z.string().describe('The natural language command from the user.'),
});
export type InterpretCommandInput = z.infer<typeof InterpretCommandInputSchema>;

export const InterpretCommandOutputSchema = z.object({
  action: z
    .enum(['generate_social_post', 'generate_outreach_email', 'unrecognized'])
    .describe('The specific action the user wants to perform.'),
  prompt: z.string().describe('The subject or prompt for the action. For outreach emails, this should be a LinkedIn URL if provided. For social posts, this is the topic.'),
});
export type InterpretCommandOutput = z.infer<typeof InterpretCommandOutputSchema>;

export async function interpretCommand(
  input: InterpretCommandInput
): Promise<InterpretCommandOutput> {
  return interpretCommandFlow(input);
}

const interpretCommandPrompt = ai.definePrompt({
  name: 'interpretCommandPrompt',
  input: { schema: InterpretCommandInputSchema },
  output: { schema: InterpretCommandOutputSchema },
  prompt: `You are an AI assistant that interprets user commands for the Omarim AI platform.
Your task is to understand the user's command and determine the appropriate action and the prompt/subject for that action.

The available actions are:
- 'generate_social_post': For when the user wants to create a social media post about a topic.
- 'generate_outreach_email': For when the user wants to create a personalized email based on a LinkedIn profile URL.
- 'unrecognized': If the command does not match any of the above actions.

Analyze the following command and determine the action and the prompt. The prompt should be the core subject of the command (e.g., the topic for a social post or the URL for an email).

Command: {{{command}}}

Respond in a JSON format.`,
});

const interpretCommandFlow = ai.defineFlow(
  {
    name: 'interpretCommandFlow',
    inputSchema: InterpretCommandInputSchema,
    outputSchema: InterpretCommandOutputSchema,
  },
  async (input) => {
    const { output } = await interpretCommandPrompt(input);
    return output!;
  }
);
