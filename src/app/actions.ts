
'use server';

import { z } from "zod";
import { revalidatePath } from 'next/cache';
import { findTrendingProductsFlow } from "@/ai/tools/find-trending-products";
import { generateProductCampaign as generateProductCampaignFlow, type GenerateProductCampaignOutput } from "@/ai/flows/generate-product-campaign";
import { 
    GenerateProductCampaignInputSchema, 
    type GenerateProductCampaignInput
} from "@/app/schemas";
import { initializeFirebase } from "@/firebase/server-init";
import { getFirestore } from "firebase-admin/firestore";
import type { QualifiedLead } from "@/ai/tools/find-and-qualify-leads";


export type TrendingProduct = GenerateProductCampaignInput;

export async function findTrendingProducts(category: string): Promise<TrendingProduct> {
    return await findTrendingProductsFlow({ category });
}

export async function generateProductCampaign(input: GenerateProductCampaignInput): Promise<GenerateProductCampaignOutput> {
    const validatedInput = GenerateProductCampaignInputSchema.parse(input);
    return await generateProductCampaignFlow(validatedInput);
}


/**
 * Saves a new lead to the database for a specific user.
 * This is a Server Action and is secure.
 */
export async function saveLeadAction(params: {
  userId: string;
  lead: QualifiedLead;
}): Promise<{ leadId: string; error?: string }> {
  const { userId, lead } = params;
  
  const app = initializeFirebase();
  const db = getFirestore(app);

  try {
    const leadData = {
      firstName: lead.name.split(' ')[0] || '',
      lastName: lead.name.split(' ').slice(1).join(' ') || '',
      company: lead.company,
      domain: lead.hasWebsite ? new URL(`http://${lead.company.toLowerCase().replace(/ /g, '')}.com`).hostname : 'unknown.com',
      email: lead.email,
      status: 'New',
    };
    const docRef = await db.collection(`users/${userId}/leads`).add(leadData);
    revalidatePath('/dashboard/leads');
    return { leadId: docRef.id };
  } catch (error: any) {
    console.error('Error saving lead (Server Action):', error);
    return { leadId: '', error: 'Failed to save lead.' };
  }
}

/**
 * Updates the status of an existing lead.
 */
export async function updateLeadStatusAction(params: {
  userId: string;
  leadId: string;
  status: string;
}): Promise<{ success: boolean; error?: string }> {
    const { userId, leadId, status } = params;

    const app = initializeFirebase();
    const db = getFirestore(app);

    try {
        const leadRef = db.collection(`users/${userId}/leads`).doc(leadId);
        await leadRef.update({ status });
        revalidatePath('/dashboard/leads');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating lead status (Server Action):', error);
        return { success: false, error: 'Failed to update lead status.' };
    }
}
