
'use client';
/**
 * @fileOverview A client-side service for interacting with Firestore.
 * This service uses the standard Firebase client SDK to perform operations,
 * ensuring that all actions are subject to Firestore Security Rules.
 */

import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    writeBatch,
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';


// This function should be called within a React component or a server action
// where the Firebase context is available.
function getClientFirestore() {
    const services = initializeFirebase();
    if (!services) {
        throw new Error("Firebase has not been initialized. This function must be called on the client.");
    }
    return services.firestore;
}

/**
 * Adds leads of a specific status to a given outreach sequence for a user.
 * This is a client-side operation and is subject to security rules.
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
  const db = getClientFirestore();

  try {
    const sequenceQuery = query(
      collection(db, `users/${userId}/outreachSequences`),
      where('name', '==', sequenceName)
    );
    const sequenceSnapshot = await getDocs(sequenceQuery);

    if (sequenceSnapshot.empty) {
      return { success: false, message: `Outreach sequence named '${sequenceName}' not found.` };
    }
    const sequenceDoc = sequenceSnapshot.docs[0];
    const existingLeadIds = new Set(sequenceDoc.data().leadIds || []);

    const leadsQuery = query(
      collection(db, `users/${userId}/leads`),
      where('status', '==', leadStatus)
    );
    const leadsSnapshot = await getDocs(leadsQuery);

    if (leadsSnapshot.empty) {
      return { success: false, message: `No leads found with status '${leadStatus}'.` };
    }

    const leadsToAdd = leadsSnapshot.docs.filter(doc => !existingLeadIds.has(doc.id));

    if (leadsToAdd.length === 0) {
      return { success: true, message: `All leads with status '${leadStatus}' are already in the sequence.`, leadsAdded: 0 };
    }

    const leadIdsToAdd = leadsToAdd.map(doc => doc.id);
    const newLeadIds = Array.from(new Set([...Array.from(existingLeadIds), ...leadIdsToAdd]));

    const batch = writeBatch(db);
    batch.update(sequenceDoc.ref, { leadIds: newLeadIds });

    for (const leadDoc of leadsToAdd) {
      batch.update(leadDoc.ref, { status: 'Contacted' });
    }

    await batch.commit();

    return { success: true, message: `Added ${leadsToAdd.length} leads.`, leadsAdded: leadsToAdd.length };

  } catch (error: any) {
    console.error("Error adding leads to sequence (client-side):", error);
    return { success: false, message: `An internal error occurred: ${error.message}` };
  }
}
