import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://cnsvfpihbylaobhfkriw.supabase.co";
const SUPABASE_KEY = "sb_publishable_H58ylK3CW-L5vBqHZxgQyQ_Riv_9YkX";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
