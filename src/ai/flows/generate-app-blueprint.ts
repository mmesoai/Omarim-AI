
'use server';
/**
 * @fileOverview A Genkit flow to generate a technical blueprint for a new application idea.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateAppBlueprintInputSchema = z.object({
  appDescription: z.string().describe('A description of the application idea, including its purpose and primary goal.'),
});
export type GenerateAppBlueprintInput = z.infer<typeof GenerateAppBlueprintInputSchema>;


const DataModelSchema = z.object({
  name: z.string().describe('The name of the data model/entity (e.g., "User", "Post").'),
  properties: z.array(z.string()).describe('A list of key properties for the model (e.g., "email", "content", "createdAt").'),
});

const FeatureSchema = z.object({
  name: z.string().describe('The name of the core feature.'),
  description: z.string().describe('A short description of what the feature does.'),
  userBenefit: z.string().describe('The primary benefit of this feature to the end-user.'),
});

const UserPersonaSchema = z.object({
    name: z.string().describe('A fictional name for the user persona.'),
    description: z.string().describe('A description of this type of user and their goals.'),
});

const GenerateAppBlueprintOutputSchema = z.object({
  appName: z.string().describe('A creative and marketable name for the application.'),
  tagline: z.string().describe('A short, catchy tagline for the app.'),
  coreFeatures: z.array(FeatureSchema).describe('A list of the 3-5 most critical features for the Minimum Viable Product (MVP).'),
  dataModels: z.array(DataModelSchema).describe('A list of the primary data models needed to support the features.'),
  userPersonas: z.array(UserPersonaSchema).describe('A description of 2-3 target user personas.'),
  techStack: z.object({
    frontend: z.string().describe('The recommended frontend framework.'),
    backend: z.string().describe('The recommended backend services/framework.'),
    database: z.string().describe('The recommended database.'),
    ai: z.string().describe('The recommended AI/ML toolkit.'),
  }).describe('The recommended technology stack.'),
});
export type GenerateAppBlueprintOutput = z.infer<typeof GenerateAppBlueprintOutputSchema>;


export async function generateAppBlueprint(input: GenerateAppBlueprintInput): Promise<GenerateAppBlueprintOutput> {
  return generateAppBlueprintFlow(input);
}


const generateAppBlueprintPrompt = ai.definePrompt({
    name: 'generateAppBlueprintPrompt',
    input: { schema: GenerateAppBlueprintInputSchema },
    output: { schema: GenerateAppBlueprintOutputSchema },
    system: `You are an expert software architect and product strategist.
Your task is to take a user's app idea and generate a comprehensive technical blueprint.
Based on the user's description, you must generate a creative app name and tagline.
You must then define the core features, data models, and user personas.
Finally, you must recommend a modern, scalable technology stack.

The technology stack should always be:
- Frontend: Next.js & React
- Backend: Genkit & Firebase Functions
- Database: Firestore
- AI: Genkit

User's App Idea:
"{{{appDescription}}}"

Generate the complete blueprint in the specified JSON format.
`,
});

const generateAppBlueprintFlow = ai.defineFlow(
  {
    name: 'generateAppBlueprintFlow',
    inputSchema: GenerateAppBlueprintInputSchema,
    outputSchema: GenerateAppBlueprintOutputSchema,
  },
  async (input) => {
    const { output } = await generateAppBlueprintPrompt(input);
    return output!;
  }
);
