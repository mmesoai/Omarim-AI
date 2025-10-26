'use server';
/**
 * @fileOverview Classifies inbound email replies based on their content using GenAI.
 *
 * - classifyInboundReply - A function that classifies inbound email replies.
 * - ClassifyInboundReplyInput - The input type for the classifyInboundReply function.
 * - ClassifyInboundReplyOutput - The return type for the classifyInboundReply function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const ClassifyInboundReplyInputSchema = z.object({
  emailBody: z.string().describe('The body of the inbound email reply.'),
});
export type ClassifyInboundReplyInput = z.infer<typeof ClassifyInboundReplyInputSchema>;

const ClassifyInboundReplyOutputSchema = z.object({
  sentiment: z.string().describe('The sentiment of the email (e.g., positive, negative, neutral).'),
  category: z.string().describe('The category of the email (e.g., question, complaint, feedback).'),
  tags: z.array(z.string()).describe('Relevant tags for the email (e.g., urgent, billing, support).'),
});
export type ClassifyInboundReplyOutput = z.infer<typeof ClassifyInboundReplyOutputSchema>;

export async function classifyInboundReply(input: ClassifyInboundReplyInput): Promise<ClassifyInboundReplyOutput> {
  return classifyInboundReplyFlow(input);
}

const classifyInboundReplyPrompt = ai.definePrompt({
  name: 'classifyInboundReplyPrompt',
  input: {schema: ClassifyInboundReplyInputSchema},
  output: {schema: ClassifyInboundReplyOutputSchema},
  model: googleAI('gemini-pro'),
  prompt: `You are an AI assistant that classifies inbound email replies based on their content.\n\nAnalyze the following email body and determine its sentiment, category, and relevant tags.\n\nEmail Body: {{{emailBody}}}\n\nSentiment (positive, negative, neutral):\nCategory (question, complaint, feedback, etc.):\nTags (urgent, billing, support, etc.):\n\nRespond in a JSON format.`,
});

const classifyInboundReplyFlow = ai.defineFlow(
  {
    name: 'classifyInboundReplyFlow',
    inputSchema: ClassifyInboundReplyInputSchema,
    outputSchema: ClassifyInboundReplyOutputSchema,
  },
  async input => {
    const {output} = await classifyInboundReplyPrompt(input);
    return output!;
  }
);
