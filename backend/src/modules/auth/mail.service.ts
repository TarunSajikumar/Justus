import nodemailer from "nodemailer";
import env from "../../config/env";

// Create transporter with Brevo SMTP
export const transporter = nodemailer.createTransport({
  host: env.brevoSmtpHost,
  port: env.brevoSmtpPort,
  secure: false,
  auth: {
    user: env.brevoSmtpUser,
    pass: env.brevoSmtpPass,
  },
});

// Verify Brevo SMTP configuration at startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ BREVO SMTP ERROR:", error);
  } else {
    console.log("✅ BREVO SMTP READY");
  }
});

export async function sendOtpEmail(email: string, otp: string | number): Promise<void> {
  const mailOptions = {
    from: env.brevoSmtpUser,
    to: email,
    subject: "JusT us Verification Code 💌",
    html: `
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
    `,
  };

  try {
    console.log(`📧 Attempting to send OTP email to ${email}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${email}:`, info.response);
    return;
  } catch (error: any) {
    console.error(`❌ Failed to send email to ${email}:`, error.message);
    
    // Provide helpful error messages
    if (error.message.includes('Invalid login') || error.message.includes('authentication failed')) {
      throw new Error(
        'Email service authentication failed. Please ensure BREVO_SMTP_PASS is correct.'
      );
    } else if (error.message.includes('ECONNREFUSED')) {
      throw new Error(
        'Could not connect to Brevo email service. Please check your internet connection.'
      );
    } else {
      throw new Error(
        `Email service failed: ${error.message}. Please try again later.`
      );
    }
  }
}
