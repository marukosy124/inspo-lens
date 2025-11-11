interface Env {
  OPENAI_API_KEY: string;
}

const env: Env = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
};

export { env };
