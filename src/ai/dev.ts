import { config } from 'dotenv';
config();

import '@/ai/flows/help-model-rollback.ts';
import '@/ai/flows/quickstart-risk-model.ts';
import '@/ai/flows/suggest-model-updates.ts';
import '@/ai/flows/fetch-eonet-events.ts';
import '@/ai/flows/fetch-firms-data.ts';
