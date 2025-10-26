'use server';
/**
 * @fileOverview A server-side service for interacting with Firestore.
 * This service uses the Firebase Admin SDK to perform backend operations.
 */

import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { firebaseConfig } from '@/firebase/config';
import type { QualifiedLead } from '@/ai/tools/find-and-qualify-leads';

// Initialize Firebase Admin SDK
function getFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }
  return initializeApp({
    projectId: firebaseConfig.projectId
  });
}

/**
 * Adds leads of a specific status to a given outreach sequence for a user.
 * @param {object} params - The parameters for the operation.
 * @param {string} params.userId - The ID of the user.
 * @param {string} params.sequenceName - The name of the outreach sequence.
 * @param {string} params.leadStatus - The status of leads to add.
 * @returns {Promise<{success: boolean, message: string, leadsAdded?: number}>} - The result of the operation.
 */
export async function addLeadsToSequence(params: {
  userId: string;
  sequenceName: string;
  leadStatus: string;
}): Promise<{ success: boolean; message: string; leadsAdded?: number }> {
  const { userId, sequenceName, leadStatus } = params;
  const db = getFirestore(getFirebaseAdminApp());

  try {
    // 1. Find the outreach sequence by name for the user
    const sequenceQuery = db
      .collection(`users/${userId}/outreachSequences`)
      .where('name', '==', sequenceName)
      .limit(1);
      
    const sequenceSnapshot = await sequenceQuery.get();

    if (sequenceSnapshot.empty) {
      return { success: false, message: `Outreach sequence named '${sequenceName}' not found.` };
    }
    const sequenceDoc = sequenceSnapshot.docs[0];
    const sequenceId = sequenceDoc.id;
    const sequenceData = sequenceDoc.data();
    const existingLeadIds = new Set(sequenceData.leadIds || []);

    // 2. Find all leads with the specified status for the user
    const leadsQuery = db
      .collection(`users/${userId}/leads`)
      .where('status', '==', leadStatus);
      
    const leadsSnapshot = await leadsQuery.get();
    
    if (leadsSnapshot.empty) {
        return { success: false, message: `No leads found with status '${leadStatus}'.` };
    }

    // 3. Filter out leads that are already in the sequence
    const leadsToAdd = leadsSnapshot.docs.filter(doc => !existingLeadIds.has(doc.id));
    
    if (leadsToAdd.length === 0) {
      return { success: true, message: `All leads with status '${leadStatus}' are already in the sequence.`, leadsAdded: 0 };
    }

    const leadIdsToAdd = leadsToAdd.map(doc => doc.id);

    // 4. Add the new lead IDs to the sequence and update their status
    const batch = db.batch();

    // Update sequence
    const newLeadIds = Array.from(new Set([...Array.from(existingLeadIds), ...leadIdsToAdd]));
    batch.update(sequenceDoc.ref, { leadIds: newLeadIds });

    // Update leads
    for (const leadDoc of leadsToAdd) {
      batch.update(leadDoc.ref, { status: 'Contacted' });
    }

    await batch.commit();

    return { success: true, message: `Added ${leadsToAdd.length} leads.`, leadsAdded: leadsToAdd.length };

  } catch (error: any) {
    console.error("Error adding leads to sequence:", error);
    return { success: false, message: `An internal error occurred: ${error.message}` };
  }
}


type LeadData = {
  firstName: string;
  lastName: string;
  company: string;
  domain: string;
  email: string;
  status: string;
};

type EmailData = {
  subject: string;
  body: string;
};

/**
 * Saves a qualified lead to the database and generates an outreach email record.
 * @param {object} params - The parameters for the operation.
 * @param {string} params.userId - The ID of the user.
 * @param {LeadData} params.leadData - The data for the lead to be created.
 * @param {EmailData} params.emailData - The content of the outreach email.
 * @returns {Promise<{leadId: string}>} - The ID of the newly created lead.
 */
export async function saveLeadAndGenerateEmail(params: {
  userId: string;
  leadData: LeadData;
  emailData: EmailData;
}): Promise<{ leadId: string }> {
  const { userId, leadData, emailData } = params;
  const db = getFirestore(getFirebaseAdminApp());

  try {
    const leadsCollection = db.collection(`users/${userId}/leads`);
    
    // Add the new lead to the 'leads' collection
    const leadDocRef = await leadsCollection.add({
      ...leadData,
      createdAt: new Date().toISOString(),
    });

    // In a real application, you would create an 'emails' subcollection
    // and add the email there, or send it via an email service.
    // For now, we'll just log it to demonstrate the process is complete.
    console.log(`Generated email for lead ${leadDocRef.id}:`);
    console.log(`Subject: ${emailData.subject}`);
    console.log(`Body: ${emailData.body}`);

    return { leadId: leadDocRef.id };
  } catch (error: any) {
    console.error("Error saving lead and generating email:", error);
    throw new Error(`An internal error occurred: ${error.message}`);
  }
}
