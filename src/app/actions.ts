
'use server';

import { z } from "zod";
import { findTrendingProductsFlow } from "@/ai/tools/find-trending-products";
import { generateProductCampaign as generateProductCampaignFlow, type GenerateProductCampaignOutput } from "@/ai/flows/generate-product-campaign";
import { 
    GenerateProductCampaignInputSchema, 
    type GenerateProductCampaignInput
} from "@/app/schemas";

export type TrendingProduct = GenerateProductCampaignInput;


export async function findTrendingProducts(category: string): Promise<TrendingProduct> {
    return await findTrendingProductsFlow({ category });
}

export async function generateProductCampaign(input: GenerateProductCampaignInput): Promise<GenerateProductCampaignOutput> {
    // We need to validate the input here before passing it to the flow
    const validatedInput = GenerateProductCampaignInputSchema.parse(input);
    return await generateProductCampaignFlow(validatedInput);
}
