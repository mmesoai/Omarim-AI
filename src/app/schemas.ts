
import { z } from "zod";

const TrendingProductSchema = z.object({
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

const SocialPostSchema = z.object({
    platform: z.enum(['Twitter', 'LinkedIn', 'Facebook']).describe('The target social media platform.'),
    content: z.string().describe('The generated content for the social media post, tailored to the platform.'),
    hashtags: z.array(z.string()).describe('A list of relevant hashtags for the post.'),
});

export const GenerateProductCampaignInputSchema = TrendingProductSchema;
export type GenerateProductCampaignInput = z.infer<typeof GenerateProductCampaignInputSchema>;

export const GenerateProductCampaignOutputSchema = z.object({
  socialPosts: z.array(SocialPostSchema).describe('A list of generated social media posts.'),
  marketingImage: z.object({
    prompt: z.string().describe('The prompt used to generate the marketing image.'),
    imageUrl: z.string().url().describe('The data URI of the generated marketing image.'),
  }),
  videoConcept: z.object({
    title: z.string().describe('A catchy title for a short promotional video (e.g., for TikTok or YouTube Shorts).'),
    sceneDescription: z.string().describe('A brief description of the scenes and actions in the video.'),
  }),
});
export type GenerateProductCampaignOutput = z.infer<typeof GenerateProductCampaignOutputSchema>;
