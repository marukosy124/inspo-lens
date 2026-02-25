interface Env {
  APP_ENV: string;
  OPENAI_API_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_PUBLISHABLE_OR_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  OFFICIAL_USER_ID: string;
}

const env: Env = {
  APP_ENV: process.env.NEXT_PUBLIC_APP_ENV || 'dev',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  SUPABASE_PUBLISHABLE_OR_ANON_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  OFFICIAL_USER_ID: process.env.OFFICIAL_USER_ID || '',
};

export { env };
