import dotenv from "dotenv";

dotenv.config();

const requiredEnv = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "EMAIL_USER",
  "EMAIL_PASS",
  "JWT_SECRET"
];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`${key} missing in .env`);
  }
});

export default process.env;
