import axios from "axios";
import env from "../../config/env";

// Brevo REST API endpoint
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const BREVO_API_KEY = env.brevoApiKey;
const FROM_EMAIL = env.emailUser;

// Verify Brevo API configuration at startup
if (!BREVO_API_KEY || !FROM_EMAIL) {
  console.warn(
    "⚠️ BREVO_SMTP_API or EMAIL_USER not configured. Email sending will fail."
  );
} else {
  console.log("✅ BREVO REST API configured and ready");
}

export async function sendOtpEmail(email: string, otp: string | number): Promise<void> {
  const htmlContent = `
    <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 20px;">
      <h2 style="color: #ff4d8d; text-align: center;">💌 Welcome to JusT us</h2>
      <p style="font-size: 16px; text-align: center;">Your secure verification code:</p>
      <div style="background: #fff0f5; padding: 20px; border-radius: 15px; text-align: center; font-size: 32px; letter-spacing: 8px; font-weight: bold; margin: 20px 0; color: #ff4d8d; border: 2px dashed #ff4d8d;">
        ${otp}
      </div>
      <p style="font-size: 14px; text-align: center; color: #777;">This OTP will expire in 10 minutes.</p>
      <p style="font-size: 14px; text-align: center; color: #777;">⚠️ Never share your OTP with anyone.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="text-align: center; font-size: 14px; color: #999;">With love,<br/>Team JusT us ❤️</p>
    </div>
  `;

  try {
    console.log(`📧 Attempting to send OTP email to ${email} via Brevo REST API`);

    const response = await axios.post(
      BREVO_API_URL,
      {
        sender: {
          email: FROM_EMAIL,
          name: "JusT us",
        },
        to: [
          {
            email: email,
            name: email.split("@")[0],
          },
        ],
        subject: "JusT us Verification Code 💌",
        htmlContent: htmlContent,
        replyTo: {
          email: FROM_EMAIL,
          name: "JusT us Support",
        },
      },
      {
        headers: {
          accept: "application/json",
          "api-key": BREVO_API_KEY,
          "content-type": "application/json",
        },
        timeout: 15000, // 15 seconds - REST API should be fast
      }
    );

    console.log(
      `✅ Email sent successfully to ${email}. Message ID:`,
      response.data.messageId
    );
    return;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Unknown error";
    console.error(`❌ Failed to send email to ${email}:`, errorMessage);

    throw new Error(`Email delivery failed: ${errorMessage}`);
  }
}
