
'use server';
/**
 * @fileOverview A flow for generating a personalized email and sending it.
 * This flow no longer interacts with the database directly.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { findAndQualifyLeads } from '@/ai/tools/find-and-qualify-leads';
import { sendEmail } from '@/ai/tools/send-email';
import { googleAI } from '@genkit-ai/google-genai';

const InitiateOutreachInputSchema = z.object({
  lead: findAndQualifyLeads.outputSchema.element, // A single qualified lead
});
export type InitiateOutreachInput = z.infer<typeof InitiateOutreachInputSchema>;

const InitiateOutreachOutputSchema = z.object({
  emailSent: z.boolean().describe('Whether the email was successfully sent.'),
  message: z.string().describe('A summary of the action taken.'),
});
export type InitiateOutreachOutput = z.infer<
  typeof InitiateOutreachOutputSchema
>;

export async function initiateOutreach(
  input: InitiateOutreachInput
): Promise<InitiateOutreachOutput> {
  return initiateOutreachFlow(input);
}

const generateEmailPrompt = ai.definePrompt({
  name: 'generateAutonomousEmailPrompt',
  input: {
    schema: z.object({
      lead: findAndQualifyLeads.outputSchema.element,
    }),
  },
  output: {
    schema: z.object({
      subject: z.string(),
      body: z.string(),
    }),
  },
  model: googleAI('gemini-pro'),
  prompt: `You are an expert sales development representative for a company called Omarim AI.
Your task is to generate a compelling and personalized outreach email to a qualified lead.

The lead has been qualified for the following reason:
"{{{lead.qualificationReason}}}"

Lead Details:
- Name: {{{lead.name}}}
- Title: {{{lead.title}}}
- Company: {{{lead.company}}}
- Industry: {{{lead.industry}}}

Based on this information, write a personalized email. The email should be concise, professional, and directly address the qualification reason.
Highlight how Omarim AI's services (like building AI-powered websites or applications) can solve a specific problem for their company.
Start the email by addressing the person by their first name.
End with a clear call to action, like suggesting a brief meeting.

Generate a subject line and a body for the email.`,
});

const initiateOutreachFlow = ai.defineFlow(
  {
    name: 'initiateOutreachFlow',
    inputSchema: InitiateOutreachInputSchema,
    outputSchema: InitiateOutreachOutputSchema,
  },
  async ({ lead }) => {
    // Step 1: Generate the personalized email using an AI prompt
    const { output: emailContent } = await generateEmailPrompt({ lead });

    if (!emailContent) {
      throw new Error('Failed to generate email content.');
    }

    // Step 2: Send the email using the sendEmail tool
    let sendResult = { success: false, message: 'Failed to send email.' };
    if (emailContent.subject && emailContent.body) {
      sendResult = await sendEmail({
        to: lead.email,
        subject: emailContent.subject,
        body: emailContent.body,
      });
    }

    return {
      emailSent: sendResult.success,
      message: sendResult.success 
        ? `Successfully sent an introductory email to ${lead.name}.`
        : `Failed to send email to ${lead.name}.`,
    };
  }
);
