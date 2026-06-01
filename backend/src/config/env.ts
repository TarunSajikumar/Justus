import dotenv from "dotenv";

dotenv.config();

const requiredEnv = [
  "MONGODB_URI",
  "JWT_SECRET",
  "SENDGRID_API_KEY",
];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`${key} missing in .env`);
  }
});

export default {
  mongodbUri: process.env.MONGODB_URI!,
  jwtSecret: process.env.JWT_SECRET!,
  sendgridApiKey: process.env.SENDGRID_API_KEY!,
  port: process.env.PORT || 5000,
};
