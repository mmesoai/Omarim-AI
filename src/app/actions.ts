'use server';

import { findTrendingProductsFlow, type TrendingProduct } from "@/ai/tools/find-trending-products";
import { generateProductCampaign as generateProductCampaignFlow, type GenerateProductCampaignOutput, type GenerateProductCampaignInput } from "@/ai/flows/generate-product-campaign";

export async function findTrendingProducts(category: string): Promise<TrendingProduct> {
    return await findTrendingProductsFlow({ category });
}

export async function generateProductCampaign(input: GenerateProductCampaignInput): Promise<GenerateProductCampaignOutput> {
    return await generateProductCampaignFlow(input);
}
