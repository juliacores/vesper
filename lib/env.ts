function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `Set it in .env.local (dev) or your hosting dashboard (prod).`
    );
  }
  return value;
}

export const env = {
  supabaseUrl: required('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: required('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
};

export function requireServerEnv() {
  return {
    openaiApiKey: required('OPENAI_API_KEY'),
    elevenLabsApiKey: required('ELEVENLABS_API_KEY'),
  };
}
