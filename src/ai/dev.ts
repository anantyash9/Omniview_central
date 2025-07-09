import { config } from 'dotenv';
config();

import '@/ai/flows/generate-incident-suggestions.ts';
import '@/ai/flows/generate-commander-brief.ts';
import '@/ai/flows/summarize-social-media.ts';
