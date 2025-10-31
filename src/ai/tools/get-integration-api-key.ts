
'use server';
/**
 * @fileOverview A Genkit tool to securely retrieve an API key for a given service.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { initializeFirebase as initializeFirebaseAdmin } from '@/firebase/server-init';
import { getFirestore } from 'firebase-admin/firestore';

const GetApiKeyInputSchema = z.object({
  userId: z.string().describe('The ID of the user requesting the key.'),
  provider: z
    .string()
    .describe(
      "The service provider for which to retrieve the key (e.g., 'sendgrid', 'printify')."
    ),
});
export type GetApiKeyInput = z.infer<typeof GetApiKeyInputSchema>;

export const getIntegrationApiKey = ai.defineTool(
  {
    name: 'getIntegrationApiKey',
    description: 'Securely retrieves the API key for a specified third-party service integration from the database.',
    inputSchema: GetApiKeyInputSchema,
    outputSchema: z.string().optional(),
  },
  async ({ userId, provider }) => {
    try {
      const db = getFirestore(initializeFirebaseAdmin());
      const docRef = db.collection(`users/${userId}/integrations`).doc(provider);
      const docSnap = await docRef.get();

      if (docSnap.exists()) {
        return docSnap.data()?.apiKey;
      } else {
        console.warn(`API key for provider '${provider}' not found for user '${userId}'.`);
        return undefined;
      }
    } catch (error) {
      console.error(`Failed to retrieve API key for ${provider}:`, error);
      return undefined;
    }
  }
);
