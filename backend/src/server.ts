import app from "./app";
import { lookup } from "dns/promises";
import { URL } from "url";

const PORT = process.env.PORT || 5000;

async function start() {
  // Supabase DNS lookup removed for development convenience.
  // If you need DNS validation, re-enable the lookup logic here.

  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
    console.log("SUPABASE_URL =", process.env.SUPABASE_URL);
    console.log("SUPABASE_ANON_KEY =", process.env.SUPABASE_ANON_KEY);
  });
}

void start();
