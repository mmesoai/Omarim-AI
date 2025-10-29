
'use server';

import { z } from "zod";
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeFirebase as initializeFirebaseAdmin } from '@/firebase/server-init';
import { findTrendingProductsFlow } from "@/ai/tools/find-trending-products";
import { generateProductCampaign as generateProductCampaignFlow, type GenerateProductCampaignOutput } from "@/ai/flows/generate-product-campaign";
import { 
    GenerateProductCampaignInputSchema, 
    type GenerateProductCampaignInput
} from "@/app/schemas";
import { 
    initiateOutreach as initiateOutreachFlow, 
    type InitiateOutreachInput, 
    type InitiateOutreachOutput 
} from "@/ai/flows/initiate-outreach-flow";


export type TrendingProduct = GenerateProductCampaignInput;


export async function findTrendingProducts(category: string): Promise<TrendingProduct> {
    return await findTrendingProductsFlow({ category });
}

export async function generateProductCampaign(input: GenerateProductCampaignInput): Promise<GenerateProductCampaignOutput> {
    const validatedInput = GenerateProductCampaignInputSchema.parse(input);
    return await generateProductCampaignFlow(validatedInput);
}

export async function initiateOutreach(input: InitiateOutreachInput): Promise<InitiateOutreachOutput> {
    return await initiateOutreachFlow(input);
}

export async function addLeadsToSequence(params: {
  userId: string;
  sequenceName: string;
  leadStatus: string;
}): Promise<{ success: boolean; message: string; leadsAdded?: number }> {
  const { userId, sequenceName, leadStatus } = params;
  const db = getFirestore(initializeFirebaseAdmin());

  try {
    const sequenceQuery = db
      .collection(`users/${userId}/outreachSequences`)
      .where('name', '==', sequenceName)
      .limit(1);
      
    const sequenceSnapshot = await sequenceQuery.get();

    if (sequenceSnapshot.empty) {
      return { success: false, message: `Outreach sequence named '${sequenceName}' not found.` };
    }
    const sequenceDoc = sequenceSnapshot.docs[0];
    const sequenceData = sequenceDoc.data();
    const existingLeadIds = new Set(sequenceData.leadIds || []);

    const leadsQuery = db
      .collection(`users/${userId}/leads`)
      .where('status', '==', leadStatus);
      
    const leadsSnapshot = await leadsQuery.get();
    
    if (leadsSnapshot.empty) {
        return { success: false, message: `No leads found with status '${leadStatus}'.` };
    }

    const leadsToAdd = leadsSnapshot.docs.filter(doc => !existingLeadIds.has(doc.id));
    
    if (leadsToAdd.length === 0) {
      return { success: true, message: `All leads with status '${leadStatus}' are already in the sequence.`, leadsAdded: 0 };
    }

    const leadIdsToAdd = leadsToAdd.map(doc => doc.id);
    const batch = db.batch();
    const newLeadIds = Array.from(new Set([...Array.from(existingLeadIds), ...leadIdsToAdd]));
    batch.update(sequenceDoc.ref, { leadIds: newLeadIds });

    for (const leadDoc of leadsToAdd) {
      batch.update(leadDoc.ref, { status: 'Contacted' });
    }

    await batch.commit();

    return { success: true, message: `Added ${leadsToAdd.length} leads to the sequence.`, leadsAdded: leadsToAdd.length };

  } catch (error: any) {
    console.error("Error adding leads to sequence:", error);
    return { success: false, message: `An internal error occurred: ${error.message}` };
  }
}

export async function saveLead(params: {
  userId: string;
  leadData: any;
  leadId?: string;
}): Promise<{ leadId: string }> {
  const { userId, leadData, leadId } = params;
  const db = getFirestore(initializeFirebaseAdmin());

  try {
    const leadsCollection = db.collection(`users/${userId}/leads`);
    
    if (leadId) {
      const leadDocRef = leadsCollection.doc(leadId);
      await leadDocRef.update({
        ...leadData,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { leadId };
    } else {
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
