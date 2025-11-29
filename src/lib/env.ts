interface Env {
  APP_ENV: string;
  OPENAI_API_KEY: string;
}

const env: Env = {
  APP_ENV: process.env.NEXT_PUBLIC_APP_ENV || 'dev',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
};

export { env };
