
'use server';

import { z } from "zod";
import { findTrendingProductsFlow } from "@/ai/tools/find-trending-products";
import { generateProductCampaign as generateProductCampaignFlow } from "@/ai/flows/generate-product-campaign";
import { 
    GenerateProductCampaignInputSchema, 
    type GenerateProductCampaignInput,
    type GenerateProductCampaignOutput
} from "@/app/schemas";

export type TrendingProduct = GenerateProductCampaignInput;


export async function findTrendingProducts(category: string): Promise<TrendingProduct> {
    return await findTrendingProductsFlow({ category });
}

export async function generateProductCampaign(input: GenerateProductCampaignInput): Promise<GenerateProductCampaignOutput> {
    return await generateProductCampaignFlow(input);
}
