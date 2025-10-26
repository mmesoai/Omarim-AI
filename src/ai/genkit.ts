import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import { geminiPro } from 'genkit/models';

export const ai = genkit({
  plugins: [googleAI()],
  defaultModel: geminiPro,
});
