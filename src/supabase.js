import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://kfpzgqmgcudancvdqgdy.supabase.co";
const SUPABASE_KEY = "sb_publishable_FGMg3o3eapl_j7zQmWXXGg_8dpv_7F3";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
