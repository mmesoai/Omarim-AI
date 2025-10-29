
'use server';
/**
 * @fileOverview A Genkit tool to get a daily sales report.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SalesReportSchema = z.object({
  totalSales: z.number().describe('The total sales amount for the day.'),
  transactionCount: z.number().describe('The number of transactions for the day.'),
  topSource: z.string().describe('The e-commerce platform with the most sales.'),
  reportSummary: z.string().describe('A spoken summary of the report.'),
});

export const getSalesReport = ai.defineTool(
  {
    name: 'getSalesReport',
    description: 'Retrieves a sales report for the current day.',
    inputSchema: z.undefined(),
    outputSchema: SalesReportSchema,
  },
  async () => {
    // In a real application, this would fetch data from a database.
    // For now, we return static mock data.
    const totalSales = 1527.48;
    const transactionCount = 5;
    const topSource = 'Shopify';
    return {
      totalSales,
      transactionCount,
      topSource,
      reportSummary: `Today's sales report is as follows: Total revenue is $${totalSales.toFixed(2)} across ${transactionCount} transactions. The top-performing sales channel is currently ${topSource}.`,
    };
  }
);
