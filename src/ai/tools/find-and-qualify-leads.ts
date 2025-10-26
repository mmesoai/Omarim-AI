'use server';
/**
 * @fileOverview A Genkit tool for finding and qualifying leads from various sources.
 * This is a simulation and uses mock data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Mock database of potential leads
const MOCK_LEADS_DATABASE = [
  { company: 'Innovate LLC', name: 'John Smith', title: 'CEO', industry: 'Tech', website: 'innovate-llc.com' },
  { company: 'Healthful Goods', name: 'Jane Doe', title: 'Founder', industry: 'Retail', website: 'healthfulgoods.com' },
  { company: 'Construct Co', name: 'Peter Jones', title: 'Director of Operations', industry: 'Construction', website: null },
  { company: 'Legal Eagles', name: 'Mary Williams', title: 'Partner', industry: 'Legal', website: 'legaleagles.net' },
  { company: 'Foodie Ventures', name: 'David Brown', title: 'Co-Owner', industry: 'Restaurant', website: null },
  { company: 'Marketing Pros', name: 'Emily Davis', title: 'Marketing Manager', industry: 'Marketing', website: 'marketingpros.com' },
  { company: 'GreenScape Landscaping', name: 'Michael Miller', title: 'Owner', industry: 'Landscaping', website: null },
  { company: 'Education Forward', name: 'Susan Wilson', title: 'Executive Director', industry: 'Education', website: 'educationforward.org'},
  { company: 'AutoFix Experts', name: 'Chris Garcia', title: 'Head Mechanic', industry: 'Automotive', website: 'autofixexperts.com'},
  { company: 'Glamour Boutique', name: 'Jessica Rodriguez', title: 'Proprietor', industry: 'Fashion', website: null},
];

const QualifiedLeadSchema = z.object({
    company: z.string().describe("The name of the lead's company."),
    name: z.string().describe("The full name of the lead."),
    title: z.string().describe("The job title of the lead (e.g., CEO, Founder, Director)."),
    industry: z.string().describe("The industry the company operates in."),
    qualificationReason: z.string().describe("The reason this lead is a good prospect, specifically why they would need an AI-powered website or application."),
    hasWebsite: z.boolean().describe("Whether the company currently has a website."),
});

export type QualifiedLead = z.infer<typeof QualifiedLeadSchema>;

export const findAndQualifyLeads = ai.defineTool(
  {
    name: 'findAndQualifyLeads',
    description: 'Finds and qualifies new business leads based on a given objective. It filters for business owners and decision-makers, and assesses their need for AI-powered web services.',
    inputSchema: z.object({
      count: z.number().describe('The desired number of qualified leads to find.'),
      leadQuery: z.string().describe('A query describing the type of leads to look for, e.g., "local businesses", "tech startups".'),
    }),
    outputSchema: z.array(QualifiedLeadSchema),
  },
  async (input) => {
    console.log('Tool `findAndQualifyLeads` called with:', input);

    const decisionMakerTitles = ['ceo', 'founder', 'owner', 'director', 'executive', 'partner', 'proprietor'];
    
    const qualifiedLeads: QualifiedLead[] = [];

    for (const lead of MOCK_LEADS_DATABASE) {
      if (qualifiedLeads.length >= input.count) {
        break;
      }

      const titleLower = lead.title.toLowerCase();
      const isDecisionMaker = decisionMakerTitles.some(t => titleLower.includes(t));

      if (isDecisionMaker) {
        let reason = '';
        if (!lead.website) {
          reason = `The company, ${lead.company}, does not appear to have a website. An AI-powered site could establish their online presence and attract new customers.`;
        } else {
          reason = `While ${lead.company} has a website, an AI-powered upgrade could introduce features like intelligent chatbots, personalized user experiences, and automated content, giving them a competitive edge in the ${lead.industry} industry.`;
        }
        
        qualifiedLeads.push({
            company: lead.company,
            name: lead.name,
            title: lead.title,
            industry: lead.industry,
            qualificationReason: reason,
            hasWebsite: !!lead.website,
        });
      }
    }

    return qualifiedLeads;
  }
);
