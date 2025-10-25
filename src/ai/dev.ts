import { config } from 'dotenv';
config();

import '@/ai/flows/classify-inbound-replies.ts';
import '@/ai/flows/convert-speech-to-text.ts';