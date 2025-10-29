
'use server';
/**
 * @fileOverview An email sending service using SendGrid.
 * It reads the API key and 'from' email from environment variables.
 */

import sgMail from '@sendgrid/mail';

// Set the API key from environment variables when the server starts.
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  subject: string;
  body: string;
}

/**
 * Sends an email using SendGrid.
 * @param {EmailParams} params - The email parameters.
 * @returns {Promise<{success: boolean, message: string}>} - The result of the operation.
 */
export async function sendEmail(params: EmailParams): Promise<{ success: boolean; message: string }> {
  const { to, subject, body } = params;
  
  // Check if the service is configured.
  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
    console.warn("SendGrid API Key or From Email not configured. Email not sent.");
    // In a real application, you might want a more user-friendly message.
    // For this prototype, we simulate success but log a warning.
    return { 
        success: true, 
        message: 'Email service is not configured. Simulating success and logging to console.' 
    };
  }
  
  const msg = {
    to: to,
    from: process.env.SENDGRID_FROM_EMAIL, // Use the verified sender email from .env
    subject: subject,
    html: body, // SendGrid uses `html` for the body
  };

  try {
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
