
'use server';
/**
 * @fileOverview A Genkit flow that answers a customer's question based on a provided system blueprint.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const AnswerCustomerQueryInputSchema = z.object({
  customerQuery: z.string().describe('The question asked by the customer.'),
  blueprint: z
    .any()
    .describe(
      'The JSON blueprint of the app or website the question is about. This serves as the knowledge base.'
    ),
});
export type AnswerCustomerQueryInput = z.infer<
  typeof AnswerCustomerQueryInputSchema
>;

const AnswerCustomerQueryOutputSchema = z.object({
  answer: z
    .string()
    .describe(
      'A clear, concise, and helpful answer to the customer query, based *only* on the provided blueprint.'
    ),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe(
      'A score from 0.0 to 1.0 indicating the AI agent`s confidence in its answer.'
    ),
  reasoning: z
    .string()
    .describe(
      'A brief explanation of how the AI arrived at its answer, referencing the blueprint.'
    ),
});
export type AnswerCustomerQueryOutput = z.infer<
  typeof AnswerCustomerQueryOutputSchema
>;

export async function answerCustomerQuery(
  input: AnswerCustomerQueryInput
): Promise<AnswerCustomerQueryOutput> {
  return answerCustomerQueryFlow(input);
}

const answerCustomerQueryPrompt = ai.definePrompt({
  name: 'answerCustomerQueryPrompt',
  input: { schema: AnswerCustomerQueryInputSchema },
  output: { schema: AnswerCustomerQueryOutputSchema },
  model: googleAI('gemini-pro'),
  system: `You are an AI customer support agent for a business created by Omarim AI.
Your ONLY source of knowledge is the JSON blueprint provided below. You must not use any outside information or make assumptions.
Your task is to answer the customer's query based strictly on the data within the provided blueprint.

1.  **Analyze the Query:** Understand what the customer is asking.
2.  **Consult the Blueprint:** Carefully examine the JSON blueprint to find the relevant information.
3.  **Formulate an Answer:** Construct a clear and direct answer. If the information is not in the blueprint, you MUST state that you do not have that information.
4.  **Calculate Confidence:** Provide a confidence score (0.0 to 1.0) based on how directly the blueprint answers the question.
5.  **Explain Reasoning:** Briefly explain which part of the blueprint you used to find the answer.

**Blueprint (Source of Truth):**
'''json
{{{json blueprint}}}
'''

**Customer's Question:**
"{{{customerQuery}}}"

Provide your response in the specified JSON format.
`,
});

const answerCustomerQueryFlow = ai.defineFlow(
  {
    name: 'answerCustomerQueryFlow',
    inputSchema: AnswerCustomerQueryInputSchema,
    outputSchema: AnswerCustomerQueryOutputSchema,
  },
  async (input) => {
    const { output } = await answerCustomerQueryPrompt(input);
    return output!;
  }
);
