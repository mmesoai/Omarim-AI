
'use server';
/**
 * @fileOverview A Genkit tool to get a report on digital products.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DigitalProductsReportSchema = z.object({
  totalProducts: z.number().describe('The total number of digital products.'),
  topSeller: z.object({
    name: z.string().describe('The name of the best-selling product.'),
    unitsSold: z.number().describe('The number of units sold for the top seller.'),
  }),
  reportSummary: z.string().describe('A spoken summary of the report.'),
});

export const getDigitalProductsReport = ai.defineTool(
  {
    name: 'getDigitalProductsReport',
    description: 'Retrieves a performance report for digital products.',
    inputSchema: z.undefined(),
    outputSchema: DigitalProductsReportSchema,
  },
  async () => {
    // In a real application, this would fetch data from a database.
    // For now, we return static mock data.
    const totalProducts = 5;
    const topSeller = {
      name: 'AI-Powered Productivity Notion Template',
      unitsSold: 124,
    };
    return {
      totalProducts,
      topSeller,
      reportSummary: `You currently have ${totalProducts} digital products. Your top seller is the "${topSeller.name}" with ${topSeller.unitsSold} units sold this month.`,
    };
  }
);
