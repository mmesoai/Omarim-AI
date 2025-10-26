
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
    // As we add features to the app, we update this object to keep the AI's self-knowledge current.
    return {
      platformName: 'Omarim AI',
      coreMission: 'To act as an autonomous business development partner, automating tasks like lead generation, outreach, and content creation to help users grow their business.',
      features: [
        {
          featureName: 'Autonomous Business Agent',
          description: 'Users can provide a high-level objective (e.g., "Find me 5 local businesses that need a new website"), and the agent will autonomously find, qualify, and even initiate contact with potential leads. It uses AI to generate plausible leads in real-time, identify decision-makers, and determine if a company could benefit from AI-powered web services.',
          relatedTools: ['autonomousLeadGen', 'initiateOutreach', 'findAndQualifyLeads'],
        },
        {
          featureName: 'Automated Digital Product Funnel',
          description: 'A fully automated channel that identifies trending digital products, generates the product content (like an e-book or course outline), creates a marketing campaign, and simulates placing it for sale. This represents a complete, hands-off business funnel.',
          relatedTools: ['automatedDigitalProductFunnel', 'findTrendingDigitalProduct', 'generateDigitalProduct'],
        },
        {
          featureName: 'E-commerce Product Sourcing',
          description: "The AI can analyze product categories to identify trending items, generate marketing campaigns, and find potential (fictional) suppliers. This allows it to autonomously propose new product opportunities and initiate contact with suppliers, representing a key outbound channel.",
          relatedTools: ['findTrendingProducts', 'generateProductCampaign', 'generateProductIdeas'],
        },
        {
          featureName: 'Conversational Chat Interface',
          description: 'A chat interface where users can issue natural language commands to the AI. The AI interprets these commands and executes the appropriate action, such as generating content, managing marketing campaigns, or navigating the user to other parts of the application.',
          relatedTools: ['interpretCommand'],
        },
        {
          featureName: 'AI-Powered Content Generation',
          description: "The AI can generate various types of content on demand. This includes personalized outreach emails based on a lead's profile and engaging social media posts on a given topic.",
          relatedTools: ['generateOutreachEmail', 'generateSocialMediaPost'],
        },
        {
          featureName: 'Voice Interaction Tools',
          description: 'The platform includes a Voice Command Center that can transcribe spoken audio into text commands and execute them. It also features text-to-speech capabilities to read text aloud in a natural-sounding AI voice.',
          relatedTools: ['convertSpeechToText', 'convertTextToSpeech'],
        },
        {
          featureName: 'Data Management & Integration',
          description: 'Omarim AI manages data in a Firestore database, including leads, outreach sequences, and products. The platform is designed for integration with third-party services like e-commerce platforms (Shopify, WooCommerce) and email providers (SendGrid).',
          relatedTools: ['manageOutreachSequence'],
        },
        {
          featureName: 'Email Inbox Analysis',
          description: 'The AI can analyze inbound email replies to determine their sentiment, categorize them (e.g., as a question or complaint), and suggest relevant tags. This helps users prioritize and manage their inbox more efficiently.',
          relatedTools: ['classifyInboundReply'],
        }
      ],
    };
  }
);

