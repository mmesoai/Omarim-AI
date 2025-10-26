
'use server';
/**
 * @fileOverview A Genkit tool for sending emails.
 * This is a simulation and does not actually send emails.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { sendEmail as sendEmailService } from '@/services/email-service';

const SendEmailInputSchema = z.object({
  to: z.string().email().describe('The email address of the recipient.'),
  subject: z.string().describe('The subject line of the email.'),
  body: z.string().describe('The HTML or text content of the email body.'),
});

const SendEmailOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const sendEmail = ai.defineTool(
  {
    name: 'sendEmail',
    description: 'Sends an email to a specified recipient. This is a crucial step for outreach.',
    inputSchema: SendEmailInputSchema,
    outputSchema: SendEmailOutputSchema,
  },
  async (input) => {
    try {
      // In a real application, this would use a service like SendGrid, AWS SES, etc.
      // We are using a simulated service for this example.
      const result = await sendEmailService(input);
      return result;
    } catch (error: any) {
      console.error('Error in sendEmail tool:', error);
      return {
        success: false,
        message: `An error occurred while sending the email: ${error.message || 'Unknown error'}`,
      };
    }
  }
);
