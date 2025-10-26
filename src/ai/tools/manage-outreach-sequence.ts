
/**
 * @fileOverview A Genkit tool for managing outreach sequences in Firestore.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { addLeadsToSequence } from '@/services/firestore-service';

export const manageOutreachSequence = ai.defineTool(
  {
    name: 'manageOutreachSequence',
    description: 'Manages outreach sequences. Use this to add leads with a specific status to a named outreach sequence.',
    inputSchema: z.object({
      userId: z.string().describe('The ID of the user for whom the action is being performed.'),
      sequenceName: z.string().describe('The name of the outreach sequence to modify.'),
      leadStatus: z.string().describe("The status of the leads to be added to the sequence (e.g., 'New')."),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string().describe('A summary of the result, e.g., "Added 5 leads to the sequence." or "Sequence not found."'),
      leadsAdded: z.number().optional().describe('The number of leads that were added.'),
    }),
  },
  async (input) => {
    try {
      const result = await addLeadsToSequence({
        userId: input.userId,
        sequenceName: input.sequenceName,
        leadStatus: input.leadStatus,
      });

      if (!result.success) {
        return { success: false, message: result.message };
      }

      return {
        success: true,
        message: `Successfully added ${result.leadsAdded} leads to the '${input.sequenceName}' sequence.`,
        leadsAdded: result.leadsAdded,
      };
    } catch (error: any) {
      console.error('Error in manageOutreachSequence tool:', error);
      return {
        success: false,
        message: `An error occurred: ${error.message || 'Unknown error'}`,
      };
    }
  }
);
