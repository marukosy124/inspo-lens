import { env } from '@/lib/env';
import { createBrowserClient } from '@supabase/ssr';

export function createSupbaseClient() {
  return createBrowserClient(
    env.SUPABASE_URL!,
    env.SUPABASE_PUBLISHABLE_OR_ANON_KEY!
  );
}

export const supabaseClient = createSupbaseClient();
