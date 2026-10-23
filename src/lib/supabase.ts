import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseReady = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseReady
  ? createClient(String(url), String(anonKey), {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

export const configMessage =
  "Ligacao ao Supabase nao configurada. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no ficheiro .env.";
