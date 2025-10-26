
'use server';
/**
 * @fileOverview An autonomous AI agent flow for creating and marketing a digital product.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { findTrendingDigitalProduct } from '@/ai/tools/find-trending-digital-product';
import { generateDigitalProduct } from '@/ai/tools/generate-digital-product';
import { generateMultipleSocialPosts } from '@/ai/flows/generate-multiple-social-posts';
import type { GenerateMultipleSocialPostsOutput } from '@/ai/flows/generate-multiple-social-posts';
import type { TrendingDigitalProduct } from '@/ai/tools/find-trending-digital-product';

const LandingPageSchema = z.object({
  html: z.string().describe("The full HTML content for a product landing page, including Tailwind CSS classes for styling. It should feature a hero section with a call-to-action, feature descriptions, and a purchase section."),
});

const generateLandingPagePrompt = ai.definePrompt({
    name: 'generateLandingPagePrompt',
    input: { schema: z.object({ 
        productIdea: z.custom<TrendingDigitalProduct>(),
        generatedContent: z.custom<Awaited<ReturnType<typeof generateDigitalProduct>>>()
    })},
    output: { schema: LandingPageSchema },
    prompt: `You are an expert web designer and copywriter. Your task is to generate the complete HTML for a high-converting landing page for a new digital product. Use Tailwind CSS for styling.

Product Details:
- Name: {{{productIdea.productName}}}
- Type: {{{productIdea.productType}}}
- Description: {{{productIdea.description}}}
- Target Audience: {{{productIdea.targetAudience}}}

The page should include:
1.  A compelling hero section with a catchy headline and a strong call-to-action (CTA) button.
2.  A section detailing the key features and benefits of the product.
3.  A final section prompting the user to purchase, with a clear price display.

Generate the full HTML for the page.
`,
});


const AutomatedDigitalProductFunnelOutputSchema = z.object({
  productIdea: findTrendingDigitalProduct.outputSchema,
  generatedContent: generateDigitalProduct.outputSchema,
  marketingCampaign: generateMultipleSocialPosts.outputSchema,
  landingPageHtml: LandingPageSchema.shape.html,
  summary: z.string().describe('A summary of the entire automated funnel process and what was created.'),
});
export type AutomatedDigitalProductFunnelOutput = z.infer<typeof AutomatedDigitalProductFunnelOutputSchema>;

export async function automatedDigitalProductFunnel(): Promise<AutomatedDigitalProductFunnelOutput> {
  return automatedDigitalProductFunnelFlow();
}

const automatedDigitalProductFunnelFlow = ai.defineFlow(
  {
    name: 'automatedDigitalProductFunnelFlow',
    inputSchema: z.undefined(),
    outputSchema: AutomatedDigitalProductFunnelOutputSchema,
  },
  async () => {
    // Step 1: Find a trending digital product idea.
    const productIdea = await findTrendingDigitalProduct();

    // Step 2: Generate the actual content for the product.
    const generatedContent = await generateDigitalProduct({ productIdea });

    // Step 3: Generate a dedicated landing page for the new product.
    const { output: landingPage } = await generateLandingPagePrompt({ productIdea, generatedContent });
     if (!landingPage) {
        throw new Error("Failed to generate landing page content.");
    }

    // Step 4: Generate social media posts to market the new product.
    const marketingCampaign = await generateMultipleSocialPosts({
        topicOrContent: `Announcing our new digital product: "${productIdea.productName}". ${productIdea.description}`,
    });

    // Step 5: Assemble the final output and generate a summary.
    const summary = `Successfully executed the weekly automated digital product funnel. A new trending product, "${productIdea.productName}," a ${productIdea.productType}, has been generated targeting ${productIdea.targetAudience}. A dedicated landing page and a multi-platform social media campaign have also been created to drive initial sales. The product is now ready for deployment.`;

    return {
      productIdea,
      generatedContent,
      marketingCampaign,
      landingPageHtml: landingPage.html,
      summary,
    };
  }
);
