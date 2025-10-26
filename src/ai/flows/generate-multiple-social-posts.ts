'use server';
/**
 * @fileOverview A Genkit flow to generate multiple social media posts from a single topic or piece of content.
 *
 * - generateMultipleSocialPosts - A function that generates a list of social media posts for various platforms.
 * - GenerateMultipleSocialPostsInput - The input type for the generateMultipleSocialPosts function.
 * - GenerateMultipleSocialPostsOutput - The return type for the generateMultipleSocialPosts function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateMultipleSocialPostsInputSchema = z.object({
  topicOrContent: z.string().describe('The topic or long-form content to be repurposed into social media posts.'),
});
export type GenerateMultipleSocialPostsInput = z.infer<typeof GenerateMultipleSocialPostsInputSchema>;

const SocialPostSchema = z.object({
    platform: z.enum(['Twitter', 'LinkedIn', 'Facebook']).describe('The target social media platform.'),
    content: z.string().describe('The generated content for the social media post, tailored to the platform.'),
    hashtags: z.array(z.string()).describe('A list of relevant hashtags for the post.'),
});

const GenerateMultipleSocialPostsOutputSchema = z.object({
  posts: z.array(SocialPostSchema).describe('A list of generated social media posts for different platforms.'),
});
export type GenerateMultipleSocialPostsOutput = z.infer<typeof GenerateMultipleSocialPostsOutputSchema>;


export async function generateMultipleSocialPosts(input: GenerateMultipleSocialPostsInput): Promise<GenerateMultipleSocialPostsOutput> {
  return generateMultipleSocialPostsFlow(input);
}


const generateMultipleSocialPostsPrompt = ai.definePrompt({
    name: 'generateMultipleSocialPostsPrompt',
    input: { schema: GenerateMultipleSocialPostsInputSchema },
    output: { schema: GenerateMultipleSocialPostsOutputSchema },
    prompt: `You are an expert social media strategist. Your task is to take the following topic or piece of content and repurpose it into three distinct social media posts, one for each of the following platforms: Twitter, LinkedIn, and Facebook.

For each platform, you must:
1.  **Tailor the Content:** Adapt the tone, length, and style to fit the platform's audience and best practices.
    - **Twitter:** Keep it concise, punchy, and engaging. Use questions or bold statements.
    - **LinkedIn:** Make it professional, insightful, and focused on business value or career development.
    - **Facebook:** Make it friendly, community-oriented, and encouraging of discussion.
2.  **Generate Hashtags:** Create a list of 3-5 relevant hashtags for each post.

Original Topic/Content:
"{{{topicOrContent}}}"

Generate one post for Twitter, one for LinkedIn, and one for Facebook.
`,
});

const generateMultipleSocialPostsFlow = ai.defineFlow(
  {
    name: 'generateMultipleSocialPostsFlow',
    inputSchema: GenerateMultipleSocialPostsInputSchema,
    outputSchema: GenerateMultipleSocialPostsOutputSchema,
  },
  async (input) => {
    const { output } = await generateMultipleSocialPostsPrompt(input);
    return output!;
  }
);
