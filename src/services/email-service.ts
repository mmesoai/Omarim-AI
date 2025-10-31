
'use server';
/**
 * @fileOverview An email sending service using SendGrid.
 * API keys are retrieved on-demand from a secure tool.
 */

import sgMail from '@sendgrid/mail';
import { getIntegrationApiKey } from '@/ai/tools/get-integration-api-key';
import { getAuth } from 'firebase-admin/auth';
import { initializeFirebase as initializeFirebaseAdmin } from '@/firebase/server-init';

interface EmailParams {
  to: string;
  subject: string;
  body: string;
}

/**
 * Sends an email using SendGrid. It dynamically fetches the user's API key.
 * @param {EmailParams} params - The email parameters.
 * @returns {Promise<{success: boolean, message: string}>} - The result of the operation.
 */
export async function sendEmail(params: EmailParams): Promise<{ success: boolean; message: string }> {
  const { to, subject, body } = params;

  try {
    // This is a server-side flow, so we need to get the currently acting user.
    // This is a placeholder for how you might get the current user in your environment.
    // In a real scenario, this might come from a session or a decoded token.
    const auth = getAuth(initializeFirebaseAdmin());
    // This is just an example, you would need a real way to get the current user's ID.
    // For this prototype, we cannot reliably get the user, so we cannot send email.
    const userId = undefined; // Replace with actual user ID retrieval logic

    if (!userId) {
        throw new Error("User ID could not be determined. Cannot send email.");
    }

    // Securely fetch the API key using the tool
    const apiKey = await getIntegrationApiKey({ userId, provider: 'sendgrid' });

    if (!apiKey) {
      console.error("SendGrid API Key not configured for the user.");
      return { 
          success: false, 
          message: 'Email service is not configured. Please connect SendGrid in your settings.' 
      };
    }
    
    sgMail.setApiKey(apiKey);

    const fromEmail = "no-reply@omarim.ai"; // A generic 'from' email

    const msg = {
      to: to,
      from: fromEmail,
      subject: subject,
      html: body,
    };

    await sgMail.send(msg);
    return { success: true, message: `Email successfully sent to ${to}` };

  } catch (error: any) {
    console.error('SendGrid Error:', error.response?.body || error);
    return {
      success: false,
      message: `Failed to send email: ${error.message || 'An unknown error occurred'}`,
    };
  }
}
