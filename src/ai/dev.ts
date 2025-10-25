'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/classify-inbound-replies.ts';
import '@/ai/flows/convert-speech-to-text.ts';
import '@/ai/flows/convert-text-to-speech.ts';
import '@/ai/flows/generate-outreach-email.ts';
import '@/ai/flows/generate-social-post.ts';
import '@/ai/flows/interpret-command.ts';
