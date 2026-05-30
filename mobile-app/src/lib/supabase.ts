import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cguemkrgfuhxxlvkbyte.supabase.com";
const supabaseAnonKey = "sb_publishable_4JBVEbNkou9lD5FQafnMJw_SF6Zw6Vx";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
