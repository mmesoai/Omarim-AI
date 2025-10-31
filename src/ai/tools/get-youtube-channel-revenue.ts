
'use server';
/**
 * @fileOverview A Genkit tool to get a report on revenue attributed to YouTube.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const YouTubeRevenueReportSchema = z.object({
  totalRevenue: z.number().describe('The total revenue attributed to YouTube marketing efforts.'),
  topPerformingVideo: z.string().describe('The name or title of the video that drove the most revenue.'),
  reportSummary: z.string().describe('A spoken summary of the YouTube revenue report.'),
});

export const getYouTubeChannelRevenue = ai.defineTool(
  {
    name: 'getYouTubeChannelRevenue',
    description: 'Retrieves a report on revenue generated from YouTube marketing efforts.',
    inputSchema: z.undefined(),
    outputSchema: YouTubeRevenueReportSchema,
  },
  async () => {
    // In a real application, this would query a database that links sales to marketing channels.
    // For now, we return static mock data.
    const totalRevenue = 457.88;
    const topPerformingVideo = 'New "EasySlice" Feature Demo';
    return {
      totalRevenue,
      topPerformingVideo,
      reportSummary: `This month, your YouTube channel has driven $${totalRevenue.toFixed(2)} in revenue. The top performing video was "${topPerformingVideo}".`,
    };
  }
);
