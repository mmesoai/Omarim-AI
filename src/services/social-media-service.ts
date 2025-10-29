
'use server';
/**
 * @fileOverview A service for publishing content to various social media platforms.
 */

import { TwitterApi } from 'twitter-api-v2';

interface PostParams {
    platform: 'Twitter' | 'LinkedIn' | 'Facebook';
    content: string;
}

/**
 * Publishes a post to a specified social media platform.
 * @param {PostParams} params - The parameters for the post.
 * @returns {Promise<{success: boolean, message: string}>} - The result of the operation.
 */
export async function publishPost(params: PostParams): Promise<{ success: boolean; message: string }> {
    const { platform, content } = params;

    switch (platform) {
        case 'Twitter':
            return postToTwitter(content);
        // Add cases for other platforms like LinkedIn, Facebook, etc.
        default:
            return { success: false, message: `Platform "${platform}" is not supported yet.` };
    }
}

async function postToTwitter(content: string): Promise<{ success: boolean; message: string }> {
    const {
        TWITTER_API_KEY,
        TWITTER_API_SECRET,
        TWITTER_ACCESS_TOKEN,
        TWITTER_ACCESS_SECRET,
    } = process.env;

    if (!TWITTER_API_KEY || !TWITTER_API_SECRET || !TWITTER_ACCESS_TOKEN || !TWITTER_ACCESS_SECRET) {
        console.warn("Twitter API credentials are not fully configured in environment variables.");
        return { success: false, message: "Twitter integration is not configured." };
    }

    try {
        const client = new TwitterApi({
            appKey: TWITTER_API_KEY,
            appSecret: TWITTER_API_SECRET,
            accessToken: TWITTER_ACCESS_TOKEN,
            accessSecret: TWITTER_ACCESS_SECRET,
        });

        const rwClient = client.readWrite;
        await rwClient.v2.tweet(content);
        
        return { success: true, message: "Successfully posted to X (Twitter)." };
    } catch (error: any) {
        console.error("Error posting to Twitter:", error);
        return { success: false, message: `Failed to post to X (Twitter): ${error.message}` };
    }
}
