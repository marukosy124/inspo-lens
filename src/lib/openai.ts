import { env } from '@/lib/env';
import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});
