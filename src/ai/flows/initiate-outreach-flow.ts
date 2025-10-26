'use server';
/**
 * @fileOverview An autonomous AI agent flow for initiating outreach to a qualified lead.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { findAndQualifyLeads } from '@/ai/tools/find-and-qualify-leads';
import { saveLead } from '@/services/firestore-service';
import { sendEmail } from '@/ai/tools/send-email';

const InitiateOutreachInputSchema = z.object({
  lead: findAndQualifyLeads.outputSchema.element, // A single qualified lead
  userId: z.string().describe('The ID of the user initiating the outreach.'),
});
export type InitiateOutreachInput = z.infer<typeof InitiateOutreachInputSchema>;

const InitiateOutreachOutputSchema = z.object({
  leadId: z.string().describe('The ID of the newly saved lead in Firestore.'),
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
  async ({ lead, userId }) => {
    // Step 1: Save the lead to the database
    const { leadId } = await saveLead({
      userId,
      leadData: {
        firstName: lead.name.split(' ')[0] || '',
        lastName: lead.name.split(' ').slice(1).join(' ') || '',
        company: lead.company,
        domain: lead.hasWebsite ? new URL(`http://${lead.company.toLowerCase().replace(/ /g, '')}.com`).hostname : 'unknown.com', // Simulate domain
        email: lead.email,
        status: 'Contacted',
      },
    });

    // Step 2: Generate the personalized email using an AI prompt
    const { output: emailContent } = await generateEmailPrompt({ lead });

    if (!emailContent) {
      throw new Error('Failed to generate email content.');
    }

    // Step 3: Send the email using the sendEmail tool
    const sendResult = await sendEmail({
      to: lead.email,
      subject: emailContent.subject,
      body: emailContent.body,
    });
    
    // Step 4: Update the lead status to 'Contacted' in Firestore
     await saveLead({
      userId,
      leadId: leadId, // Pass leadId to update the existing document
      leadData: { status: 'Contacted' },
    });


    return {
      leadId,
      emailSent: sendResult.success,
      message: sendResult.success 
        ? `Successfully engaged ${lead.name} and sent an introductory email.`
        : `Saved ${lead.name} as a lead, but failed to send email.`,
    };
  }
);
