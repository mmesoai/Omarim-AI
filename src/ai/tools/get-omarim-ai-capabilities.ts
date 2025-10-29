
/**
 * @fileOverview A Genkit tool that provides a structured overview of the Omarim AI platform's capabilities.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const OmarimFeatureSchema = z.object({
  featureName: z.string().describe('The name of the feature.'),
  description: z.string().describe('A detailed description of what the feature does and its value to the user.'),
  relatedTools: z.array(z.string()).optional().describe('Any specific AI tools or flows associated with this feature.'),
});

const CapabilitiesSchema = z.object({
  platformName: z.string().describe('The name of the AI platform.'),
  coreMission: z.string().describe('The primary mission or goal of the platform.'),
  features: z.array(OmarimFeatureSchema).describe('A list of the core features of the platform.'),
});

export const getOmarimAiCapabilities = ai.defineTool(
  {
    name: 'getOmarimAiCapabilities',
    description: 'Retrieves a structured list of all capabilities and features of the Omarim AI platform. Use this to answer questions about what the AI can do.',
    inputSchema: z.undefined(), // No input needed
    outputSchema: CapabilitiesSchema,
  },
  async () => {
    // This is the single source of truth for the AI's capabilities.
    // It is written from the perspective of Omarim AI.
    return {
      platformName: 'Omarim AI',
      coreMission: 'I am an autonomous business development partner. My mission is to automate tasks like lead generation, outreach, and content creation to help you grow your business.',
      features: [
        {
          featureName: 'Autonomous Business Agent',
          description: 'You can give me a high-level objective, like "Find 5 local businesses that need a new website," and I will autonomously find, qualify, and even initiate contact with potential leads for you.',
          relatedTools: ['autonomousLeadGen', 'initiateOutreach'],
        },
        {
          featureName: 'Automated Digital Product Funnel',
          description: 'I can run a fully automated workflow to identify a trending digital product, generate its content (like an e-book), and create a complete marketing campaign to sell it.',
          relatedTools: ['automatedDigitalProductFunnel'],
        },
        {
          featureName: 'E-commerce Product Sourcing',
          description: "I can analyze product categories to find trending items, generate marketing campaigns, and even identify potential suppliers, helping you discover new product opportunities.",
          relatedTools: ['findTrendingProducts', 'generateProductCampaign'],
        },
        {
          featureName: 'Conversational Chat & Voice',
          description: 'You can issue commands to me using natural language, either through text chat or by speaking to me in the Voice Command Center.',
          relatedTools: ['interpretCommand', 'convertSpeechToText'],
        },
        {
          featureName: 'AI Blueprint Generator',
          description: "I can generate various types of strategic documents on demand. This includes creating a full technical blueprint for a new app idea or a complete sitemap and strategy for a new website.",
          relatedTools: ['generateAppBlueprint', 'generateSiteBlueprint'],
        },
        {
          featureName: 'Inbox Analysis',
          description: 'I can analyze your inbound email replies to determine their sentiment and category, helping you prioritize and manage your inbox more efficiently.',
          relatedTools: ['classifyInboundReply'],
        }
      ],
    };
  }
);
