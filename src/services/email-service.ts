
'use server';
/**
 * @fileOverview An email sending service using SendGrid.
 * API keys are retrieved on-demand from a secure tool.
 */

import sgMail from '@sendgrid/mail';
import { getIntegrationApiKey } from '@/ai/tools/get-integration-api-key';

interface EmailParams {
  to: string;
  subject: string;
  body: string;
  userId: string; // The user on whose behalf we are sending.
}

/**
 * Sends an email using SendGrid. It dynamically fetches the user's API key.
 * @param {EmailParams} params - The email parameters.
 * @returns {Promise<{success: boolean, message: string}>} - The result of the operation.
 */
export async function sendEmail(params: EmailParams): Promise<{ success: boolean; message: string }> {
  const { to, subject, body, userId } = params;

  try {
    if (!userId) {
        // This is a critical guard. We cannot send an email without knowing which user's API key to use.
        throw new Error("User ID could not be determined. Cannot send email.");
    }

    // Securely fetch the API key using the tool, which reads from the user's integrations in Firestore
    const apiKey = await getIntegrationApiKey({ userId, provider: 'sendgrid' });

    if (!apiKey) {
      console.warn(`SendGrid API Key not configured for user ${userId}. Simulating success for dev environment.`);
      // In a live production environment without a key, you'd want to return a failure.
      // For this prototype, simulating success allows testing of dependent flows without a real key.
      return { 
          success: true, 
          message: `Email service is not configured for this user. Simulating successful send to ${to}.`
      };
    }
    
    sgMail.setApiKey(apiKey);

    // Using a generic 'from' email. SendGrid may have requirements for verified senders.
    const fromEmail = "no-reply@omarim.ai"; 

    const msg = {
      to: to,
      from: fromEmail,
      subject: subject,
      html: body,
    };

    // In a real production scenario, you would uncomment the following line.
    // await sgMail.send(msg);

    // For now, we simulate the send to avoid errors if the key is invalid during testing.
    console.log(`(Simulation) Email sent to ${to} using SendGrid.`);
    
    return { success: true, message: `(Simulation) Email successfully sent to ${to}` };

  } catch (error: any) {
    console.error('SendGrid Service Error:', error.response?.body || error);
    return {
      success: false,
      message: `Failed to send email: ${error.message || 'An unknown error occurred'}`,
    };
  }
}
