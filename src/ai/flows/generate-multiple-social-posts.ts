
'use server';
/**
 * @fileOverview A Genkit flow to generate multiple social media posts from a single topic, piece of content, or YouTube URL.
 *
 * - generateMultipleSocialPosts - A function that generates a list of social media posts for various platforms.
 * - GenerateMultipleSocialPostsInput - The input type for the generateMultipleSocialPosts function.
 * - GenerateMultipleSocialPostsOutput - The return type for the generateMultipleSocialPosts function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateMultipleSocialPostsInputSchema = z.object({
  topicOrContent: z.string().describe('The topic or long-form content to be repurposed into social media posts.'),
  youtubeUrl: z.string().url().optional().describe('An optional YouTube URL to create promotional posts for.'),
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
    prompt: `You are an expert social media strategist. Your task is to take the following input and repurpose it into three distinct social media posts, one for each of the following platforms: Twitter, LinkedIn, and Facebook.

The input may be a general topic, a piece of content, a YouTube URL, or a combination.

{{#if youtubeUrl}}
The primary source is this YouTube video: {{{youtubeUrl}}}
Assume you have watched the video. Your main goal is to drive traffic to this video. Create posts that are engaging, summarize a key point or a question from the video, and strongly encourage users to watch it.
{{/if}}

{{#if topicOrContent}}
The provided topic/content is: "{{{topicOrContent}}}"
{{#if youtubeUrl}}
Use this content to add context to the YouTube video promotion.
{{else}}
Use this as the primary source for generating the posts.
{{/if}}
{{/if}}

For each platform, you must:
1.  **Tailor the Content:** Adapt the tone, length, and style to fit the platform's audience and best practices.
    - **Twitter:** Keep it concise, punchy, and engaging. Use questions or bold statements.
    - **LinkedIn:** Make it professional, insightful, and focused on business value or career development.
    - **Facebook:** Make it friendly, community-oriented, and encouraging of discussion.
2.  **Generate Hashtags:** Create a list of 3-5 relevant hashtags for each post.

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
