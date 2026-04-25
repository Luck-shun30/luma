import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SUPABASE_SECRET_KEY: z.string().min(1).optional(),
  GEMINI_API_KEY: z.string().min(1).optional(),
  GOOGLE_API_KEY: z.string().min(1).optional(),
  GEMINI_MODEL: z.string().min(1).optional(),
  GEMINI_EMBEDDING_MODEL: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  INNGEST_EVENT_KEY: z.string().min(1).optional(),
  INNGEST_SIGNING_KEY: z.string().min(1).optional(),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL,
  GEMINI_EMBEDDING_MODEL: process.env.GEMINI_EMBEDDING_MODEL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
  INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,
});

export const supabasePublicKey =
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseServiceKey =
  env.SUPABASE_SERVICE_ROLE_KEY ??
  env.SUPABASE_SECRET_KEY;

export const geminiApiKey =
  env.GEMINI_API_KEY ??
  env.GOOGLE_API_KEY;

export const geminiModel = env.GEMINI_MODEL ?? "gemini-2.5-flash";

export const geminiEmbeddingModel =
  env.GEMINI_EMBEDDING_MODEL ?? "gemini-embedding-001";

export const hasSupabaseEnv = Boolean(
  env.NEXT_PUBLIC_SUPABASE_URL && supabasePublicKey,
);

export const hasSupabaseAdminEnv = Boolean(
  hasSupabaseEnv && supabaseServiceKey,
);

export const hasGeminiEnv = Boolean(geminiApiKey);

export const hasInngestEnv = Boolean(env.INNGEST_EVENT_KEY);

export function getAppUrl() {
  return env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
