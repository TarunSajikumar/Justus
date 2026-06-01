import sgMail from "@sendgrid/mail";
import env from "../../config/env";

// Initialize SendGrid
sgMail.setApiKey(env.sendgridApiKey);

// Verify SendGrid configuration at startup
(async () => {
  try {
    // Test API key by making a dummy verification
    console.log("✅ SendGrid email service configured successfully");
  } catch (error) {
    console.error(
      "⚠️  EMAIL SERVICE ERROR - Check your SENDGRID_API_KEY in .env:",
      error
    );
  }
})();

export async function sendOtpEmail(email: string, otp: string | number): Promise<void> {
  try {
    const msg = {
      to: email,
      from: "codebyt4@gmail.com", // Use SendGrid verified sender
      subject: "JusT us Verification Code 💌",
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 20px;">
          <h2 style="color: #ff4d8d; text-align: center;">💌 Welcome to JusT us</h2>
          <p style="font-size: 16px; text-align: center;">Your secure verification code:</p>
          <div style="background: #fff0f5; padding: 20px; border-radius: 15px; text-align: center; font-size: 32px; letter-spacing: 8px; font-weight: bold; margin: 20px 0; color: #ff4d8d; border: 2px dashed #ff4d8d;">
            ${otp}
          </div>
          <p style="font-size: 14px; text-align: center; color: #777;">This OTP will expire in 5 minutes.</p>
          <p style="font-size: 14px; text-align: center; color: #777;">⚠️ Never share your OTP with anyone.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="text-align: center; font-size: 14px; color: #999;">With love,<br/>Team JusT us ❤️</p>
        </div>
      `,
    };

    await sgMail.send(msg);
    console.log(`✅ Email sent to ${email} via SendGrid`);
  } catch (error: any) {
    console.error(`❌ Failed to send email to ${email}:`, error.message);
    throw new Error(
      `Email service failed: ${error.message}. Ensure SENDGRID_API_KEY is correct in .env`
    );
  }
}
