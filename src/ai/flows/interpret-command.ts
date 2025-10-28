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
import { googleAI } from '@genkit-ai/google-genai';

const InterpretCommandInputSchema = z.object({
  command: z.string().describe('The natural language command from the user.'),
});
export type InterpretCommandInput = z.infer<typeof InterpretCommandInputSchema>;

const InterpretCommandOutputSchema = z.object({
  action: z
    .enum(['generate_social_post', 'run_autonomous_agent', 'add_store', 'manage_campaign', 'answer_self_knowledge_question', 'unrecognized'])
    .describe('The specific action the user wants to perform.'),
  prompt: z.string().describe('The subject or prompt for the action. For autonomous agent, this is the objective. For social posts, this is the topic. For adding a store, this could be the type of store (e.g., Shopify). For campaign management, this is the original user command. For self-knowledge questions, this is the original question.'),
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
  model: googleAI('gemini-pro'),
  prompt: `You are the AI assistant for the Omarim AI platform. Your name is Omarim.
Your task is to understand the user's command and determine the appropriate action and the prompt/subject for that action.

The available actions are:
- 'generate_social_post': For when the user wants to create a social media post about a topic.
- 'run_autonomous_agent': For when a user gives a high-level objective to find leads or businesses, like "Find me 5 local businesses..."
- 'add_store': For when the user wants to connect a new e-commerce store, like Shopify or WooCommerce.
- 'manage_campaign': For commands related to managing outreach sequences, such as adding leads to a campaign.
- 'answer_self_knowledge_question': For when the user asks a question about you (your name, your features, what you can do, who you are, or a vague prompt like "tell me about yourself" or "tell me about").
- 'unrecognized': If the command does not match any of the above actions.

Analyze the following command and determine the action and the prompt.
- For 'generate_social_post', the prompt is the topic.
- For 'run_autonomous_agent', the prompt is the user's full high-level objective.
- For 'add_store', the prompt should be the platform type if mentioned (e.g., "Shopify", "WooCommerce"). If not mentioned, the prompt can be empty.
- For 'manage_campaign', the prompt should be the user's original command text.
- For 'answer_self_knowledge_question', the prompt should be the user's original question.

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
