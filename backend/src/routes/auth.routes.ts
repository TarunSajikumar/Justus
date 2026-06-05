import express from "express";
import {
  signup,
  verifyEmailOtp,
  register,
  login,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  getProfile,
  updateProfile,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-email-otp", verifyEmailOtp);
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

router.get("/me", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

// Test email endpoint - sends a test OTP email
router.get("/test-email", async (req, res) => {
  try {
    const { transporter } = await import("../modules/auth/mail.service");
    const testEmail = "test@example.com";
    
    const mailOptions = {
      from: process.env.BREVO_SMTP_USER,
      to: testEmail,
      subject: "🔐 Test Email from JusT us",
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 20px;">
          <h2 style="color: #ff4d8d; text-align: center;">✅ Test Email Successful</h2>
          <p style="font-size: 16px; text-align: center;">This is a test email from the Brevo SMTP configuration.</p>
          <p style="font-size: 14px; text-align: center; color: #777;">If you received this email, Brevo SMTP is working correctly!</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ 
      message: "Test email sent successfully",
      sentTo: testEmail,
      status: "✅ BREVO SMTP WORKING"
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: "Failed to send test email",
      error: error.message,
      status: "❌ BREVO SMTP ERROR"
    });
  }
});

export default router;
