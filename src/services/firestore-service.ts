'use server';
/**
 * @fileOverview A server-side service for interacting with Firestore.
 * This service uses the Firebase Admin SDK to perform backend operations.
 */

import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { firebaseConfig } from '@/firebase/config';

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
  firstName?: string;
  lastName?: string;
  company?: string;
  domain?: string;
  email?: string;
  status?: string;
};

/**
 * Saves or updates a lead in the database.
 * If a leadId is provided, it updates the existing lead. Otherwise, it creates a new one.
 * @param {object} params - The parameters for the operation.
 * @param {string} params.userId - The ID of the user.
 * @param {LeadData} params.leadData - The data for the lead.
 * @param {string} [params.leadId] - The ID of the lead to update.
 * @returns {Promise<{leadId: string}>} - The ID of the created or updated lead.
 */
export async function saveLead(params: {
  userId: string;
  leadData: LeadData;
  leadId?: string;
}): Promise<{ leadId: string }> {
  const { userId, leadData, leadId } = params;
  const db = getFirestore(getFirebaseAdminApp());

  try {
    const leadsCollection = db.collection(`users/${userId}/leads`);
    
    if (leadId) {
      // Update existing lead
      const leadDocRef = leadsCollection.doc(leadId);
      await leadDocRef.update({
        ...leadData,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { leadId };
    } else {
      // Create new lead
      const leadDocRef = await leadsCollection.add({
        ...leadData,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { leadId: leadDocRef.id };
    }
  } catch (error: any) {
    console.error("Error saving lead:", error);
    throw new Error(`An internal error occurred while saving the lead: ${error.message}`);
  }
}
