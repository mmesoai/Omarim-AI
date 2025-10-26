'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/classify-inbound-replies.ts';
import '@/ai/flows/convert-speech-to-text.ts';
import '@/ai/flows/convert-text-to-speech.ts';
import '@/ai/flows/generate-outreach-email.ts';
import '@/ai/flows/generate-social-post.ts';
import '@/ai/flows/interpret-command.ts';
import '@/ai/flows/execute-campaign-action.ts';
import '@/ai/flows/autonomous-lead-gen-flow.ts';
import '@/ai/flows/initiate-outreach-flow.ts';
import '@/ai/flows/answer-self-knowledge-question.ts';
import '@/ai/tools/send-email';
import '@/ai/tools/get-omarim-ai-capabilities';
