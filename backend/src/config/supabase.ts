import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Supabase environment variables are missing!");
} else {
  console.log(`✅ Supabase initialized with URL: ${supabaseUrl}`);
}

export const supabase = createClient(
  supabaseUrl || "",
  supabaseAnonKey || ""
);
