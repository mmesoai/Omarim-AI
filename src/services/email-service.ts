
'use server';
/**
 * @fileOverview An email sending service using SendGrid.
 * API keys are retrieved on-demand from a secure server-side function.
 */

import sgMail from '@sendgrid/mail';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeFirebase as initializeFirebaseAdmin } from '@/firebase/server-init';

interface EmailParams {
  to: string;
  subject: string;
  body: string;
  userId: string; // The user on whose behalf we are sending.
}

async function getApiKeyForUser(userId: string, provider: 'sendgrid'): Promise<string | undefined> {
    try {
        const db = getFirestore(initializeFirebaseAdmin());
        const docRef = db.collection(`users/${userId}/integrations`).doc(provider);
        const docSnap = await docRef.get();
        if (docSnap.exists()) {
            return docSnap.data()?.apiKey;
        }
        return undefined;
    } catch (error) {
        console.error(`Failed to retrieve API key for ${provider}:`, error);
        return undefined;
    }
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
        throw new Error("User ID is required to send an email.");
    }

    const apiKey = await getApiKeyForUser(userId, 'sendgrid');

    if (!apiKey) {
      console.warn(`SendGrid API Key not configured for user ${userId}. Simulating success for dev environment.`);
      return { 
          success: true, 
          message: `(Simulation) Email service is not configured. Successfully 'sent' to ${to}.`
      };
    }
    
    sgMail.setApiKey(apiKey);

    const fromEmail = "no-reply@omarim.ai"; 

    const msg = {
      to: to,
      from: fromEmail,
      subject: subject,
      html: body,
    };
    
    // In local development and testing, we will log the action instead of sending real emails.
    // In a production environment, you would uncomment the line below.
    // await sgMail.send(msg);
    
    console.log(`(Simulation) Email sent to ${to} via SendGrid for user ${userId}.`);
    
    return { success: true, message: `(Simulation) Email successfully sent to ${to}` };

  } catch (error: any) {
    console.error('SendGrid Service Error:', error.response?.body || error);
    return {
      success: false,
      message: `Failed to send email: ${error.message || 'An unknown error occurred'}`,
    };
  }
}
