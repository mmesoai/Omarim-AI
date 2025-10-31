
'use server';

import { z } from "zod";
import { findTrendingProductsFlow } from "@/ai/tools/find-trending-products";
import { generateProductCampaign as generateProductCampaignFlow, type GenerateProductCampaignOutput } from "@/ai/flows/generate-product-campaign";
import { sourceProductFromImage as sourceProductFromImageFlow, type SourceProductFromImageInput, type SourceProductFromImageOutput } from '@/ai/flows/source-product-from-image';
import { 
    GenerateProductCampaignInputSchema, 
    type GenerateProductCampaignInput
} from "@/app/schemas";
import { 
    initiateOutreach as initiateOutreachFlow, 
    type InitiateOutreachInput, 
    type InitiateOutreachOutput 
} from "@/ai/flows/initiate-outreach-flow";
import { addLeadsToSequence as addLeadsToSequenceService, saveLead as saveLeadService } from '@/services/firestore-service';


export type TrendingProduct = GenerateProductCampaignInput;


export async function findTrendingProducts(category: string): Promise<TrendingProduct> {
    return await findTrendingProductsFlow({ category });
}

export async function generateProductCampaign(input: GenerateProductCampaignInput): Promise<GenerateProductCampaignOutput> {
    const validatedInput = GenerateProductCampaignInputSchema.parse(input);
    return await generateProductCampaignFlow(validatedInput);
}

export async function sourceProductFromImage(input: SourceProductFromImageInput): Promise<SourceProductFromImageOutput> {
    return await sourceProductFromImageFlow(input);
}

export async function initiateOutreach(input: InitiateOutreachInput): Promise<InitiateOutreachOutput> {
    return await initiateOutreachFlow(input);
}

export async function addLeadsToSequence(params: {
  userId: string;
  sequenceName: string;
  leadStatus: string;
}): Promise<{ success: boolean; message: string; leadsAdded?: number }> {
    return addLeadsToSequenceService(params);
}

export async function saveLead(params: {
  userId: string;
  leadData: any;
  leadId?: string;
}): Promise<{ leadId: string }> {
    return saveLeadService(params);
}
