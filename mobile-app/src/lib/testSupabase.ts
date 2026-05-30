import { supabase } from "./supabase";

export const testSupabase = async () => {
  const { data, error } = await supabase.from("users").select("*");
  console.log(data, error);
};

// Run manually during development
// testSupabase();
