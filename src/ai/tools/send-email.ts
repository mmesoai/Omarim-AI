
/**
 * @fileOverview A Genkit tool for sending emails using the email service.
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
    description: 'Sends an email to a specified recipient using the configured email service (SendGrid). This is a crucial step for outreach.',
    inputSchema: SendEmailInputSchema,
    outputSchema: SendEmailOutputSchema,
  },
  async (input) => {
    try {
      // The service now handles the logic of whether to send a real email
      // or simulate it based on environment variable configuration.
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
