import dotenv from "dotenv";

dotenv.config();

const requiredEnv = [
  "MONGODB_URI",
  "JWT_SECRET",
  "BREVO_SMTP_API",
  "EMAIL_USER",
];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`⚠️ ${key} missing in .env`);
  }
});

export default {
  mongodbUri: process.env.MONGODB_URI!,
  jwtSecret: process.env.JWT_SECRET!,
  brevoApiKey: process.env.BREVO_SMTP_API || process.env.BREVO_API_KEY,
  emailUser: process.env.EMAIL_USER || "noreply@justus.com",
  port: process.env.PORT || 5000,

  // Optional Twilio Config
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,

  // Optional Cloudinary Config
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
};
