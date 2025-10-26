
'use server';
/**
 * @fileOverview A flow that allows Omarim AI to answer questions about its own capabilities.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getOmarimAiCapabilities } from '@/ai/tools/get-omarim-ai-capabilities';

const AnswerSelfKnowledgeInputSchema = z.object({
  question: z.string().describe("The user's question about Omarim AI."),
});
export type AnswerSelfKnowledgeInput = z.infer<typeof AnswerSelfKnowledgeInputSchema>;

const AnswerSelfKnowledgeOutputSchema = z.object({
  answer: z.string().describe("The AI's answer to the user's question."),
});
export type AnswerSelfKnowledgeOutput = z.infer<typeof AnswerSelfKnowledgeOutputSchema>;

export async function answerSelfKnowledgeQuestion(input: AnswerSelfKnowledgeInput): Promise<AnswerSelfKnowledgeOutput> {
  return answerSelfKnowledgeQuestionFlow(input);
}

const answerSelfKnowledgePrompt = ai.definePrompt({
  name: 'answerSelfKnowledgePrompt',
  input: { schema: AnswerSelfKnowledgeInputSchema },
  output: { schema: AnswerSelfKnowledgeOutputSchema },
  tools: [getOmarimAiCapabilities],
  system: `You are Omarim AI, a helpful assistant.
Your task is to answer the user's question about your capabilities.
To do this, you MUST first call the \`getOmarimAiCapabilities\` tool to get a structured overview of all your features.
Then, use the information returned from the tool to formulate a clear, concise, and helpful answer to the user's question.
Base your answer ONLY on the information provided by the tool.
Do not make up features you do not have. Do not discuss capabilities beyond what is explicitly listed in the tool's output.

User's Question: {{{question}}}
`,
});

const answerSelfKnowledgeQuestionFlow = ai.defineFlow(
  {
    name: 'answerSelfKnowledgeQuestionFlow',
    inputSchema: AnswerSelfKnowledgeInputSchema,
    outputSchema: AnswerSelfKnowledgeOutputSchema,
  },
  async (input) => {
    const { output } = await answerSelfKnowledgePrompt(input);
    return output!;
  }
);
