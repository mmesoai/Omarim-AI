
'use server';

import { z } from "zod";
import { revalidatePath } from 'next/cache';
import { findTrendingProducts as findTrendingProductsFlow } from "@/ai/tools/find-trending-products";
import { generateProductCampaign as generateProductCampaignFlow, type GenerateProductCampaignOutput } from "@/ai/flows/generate-product-campaign";
import { 
    GenerateProductCampaignInputSchema, 
    type GenerateProductCampaignInput
} from "@/app/schemas";
import { initializeFirebase } from "@/firebase/server-init";
import { getFirestore } from "firebase-admin/firestore";
import type { QualifiedLead } from "@/ai/tools/find-and-qualify-leads";
import { initiateOutreach as initiateOutreachFlow } from '@/ai/flows/initiate-outreach-flow';


export type TrendingProduct = GenerateProductCampaignInput;

export async function findTrendingProducts(category: string): Promise<GenerateProductCampaignInput> {
    return await findTrendingProductsFlow({ category });
}

export async function generateProductCampaign(input: GenerateProductCampaignInput): Promise<GenerateProductCampaignOutput> {
    const validatedInput = GenerateProductCampaignInputSchema.parse(input);
    return await generateProductCampaignFlow(validatedInput);
}

/**
 * Saves a lead, generates an outreach email, sends it, and updates the lead's status.
 * This is a comprehensive server action to handle the entire lead engagement process.
 */
export async function initiateOutreach(params: {
  userId: string;
  lead: QualifiedLead;
}): Promise<{ success: boolean; message: string; }> {
  const { userId, lead } = params;

  try {
    // Step 1: Save the lead to the database.
    const app = initializeFirebase();
    const db = getFirestore(app);
    const leadData = {
      firstName: lead.name.split(' ')[0] || '',
      lastName: lead.name.split(' ').slice(1).join(' ') || '',
      company: lead.company,
      domain: lead.hasWebsite ? new URL(`http://${lead.company.toLowerCase().replace(/ /g, '')}.com`).hostname : 'unknown.com',
      email: lead.email,
      status: 'New', // Start with New status
    };
    const leadRef = await db.collection(`users/${userId}/leads`).add(leadData);
    
    // Step 2: Generate and send the email via the AI flow.
    const outreachResult = await initiateOutreachFlow({ lead });

    if (!outreachResult.emailSent) {
      // If email fails, the lead is still saved, but we return a partial success message.
      revalidatePath('/dashboard/leads');
      return { success: false, message: `Lead for ${lead.name} saved, but email failed: ${outreachResult.message}` };
    }

    // Step 3: If email was sent successfully, update the lead's status to 'Contacted'.
    await leadRef.update({ status: 'Contacted' });

    revalidatePath('/dashboard/leads');
    return { success: true, message: `Successfully engaged ${lead.name}. Email sent and lead status updated.` };

  } catch (error: any) {
    console.error('Error in initiateOutreach server action:', error);
    return { success: false, message: error.message || 'An unknown error occurred during the outreach process.' };
  }
}
