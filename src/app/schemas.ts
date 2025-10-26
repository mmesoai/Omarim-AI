
import { z } from "zod";

// This schema is used by the client-side action and the server-side flow.
// It is safe to be in a shared location.
export const GenerateProductCampaignInputSchema = z.object({
    productName: z.string().describe("The name of the trending product."),
    description: z.string().describe("A brief description of the product and why it's trending."),
    targetAudience: z.string().describe("The primary target audience for this product."),
    estimatedSalePrice: z.number().describe("The estimated retail price for the product."),
    supplier: z.object({
        name: z.string().describe("The name of a plausible, fictional supplier for this product."),
        contactEmail: z.string().email().describe("A plausible fictional email address for the supplier."),
    }).describe("Information about a potential supplier."),
    marketingAngle: z.string().describe("A creative marketing angle to promote this product, suitable for a social media or email campaign."),
});

export type GenerateProductCampaignInput = z.infer<typeof GenerateProductCampaignInputSchema>;
