import { createClient } from "@supabase/supabase-js";

const url = String(import.meta.env.VITE_SUPABASE_URL ?? "")
  .trim()
  .replace(/\/$/, "");
const anonKey = String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "").trim();

export const supabase = createClient(url, anonKey);
