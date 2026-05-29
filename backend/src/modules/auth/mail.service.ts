import nodemailer from "nodemailer";

const { EMAIL_USER, EMAIL_PASS } = process.env;

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export async function sendOtpEmail(email: string, otp: string | number): Promise<void> {
  if (!EMAIL_USER) throw new Error("EMAIL_USER is not set in environment variables");
  await transporter.sendMail({
    from: EMAIL_USER,
    to: email,
    subject: "JUSTUS OTP",
    html: `
      <p>Your OTP</p>
      <p><strong>${otp}</strong></p>
      <p>Valid for 5 minutes.</p>
    `,
  });
}

export default transporter;
