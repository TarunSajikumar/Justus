import otpGenerator from "otp-generator";
import { supabase } from "../../config/supabase";
import { transporter } from "./mail.service";
import Twilio from "twilio";

const isPhone = (s: string) => /^\+?[0-9]{7,}$/.test(s || "");

export const sendOtp = async (contact: string): Promise<boolean> => {
  // Rate limit: prevent resending too frequently
  const RATE_LIMIT_SECONDS = 60;

  const { data: last, error: fetchError } = await supabase
    .from('otp_codes')
    .select('created_at')
    .eq('contact', contact)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (last) {
    const since = (Date.now() - new Date(last.created_at).getTime()) / 1000;
    if (since < RATE_LIMIT_SECONDS) {
      const wait = Math.ceil(RATE_LIMIT_SECONDS - since);
      throw { status: 429, message: `Please wait ${wait} seconds before requesting another code` };
    }
  }

  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  const { error: insertError } = await supabase
    .from('otp_codes')
    .insert({
      contact,
      code: otp,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });

  if (insertError) {
    console.error('Supabase OTP insert error:', insertError);
    throw new Error("Failed to generate OTP");
  }

  // If contact looks like a phone number and Twilio is configured, send SMS
  if (isPhone(contact) && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM) {
    try {
      const client = Twilio(process.env.TWILIO_ACCOUNT_SID as string, process.env.TWILIO_AUTH_TOKEN as string);
      await client.messages.create({
        body: `Your JusT us verification code is ${otp}. It expires in 5 minutes.`,
        from: process.env.TWILIO_FROM,
        to: contact,
      });
      return true;
    } catch (err) {
      console.error('Twilio send error', err);
      // fallback to email if possible
    }
  }

  // Fallback / default: treat as email and send via nodemailer
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: contact,
    subject: "JusT us Verification Code 💌",
    html: `
      <p>💌 Welcome to JusT us</p>
      <p>Your secure verification code:</p>
      <p><strong>${otp}</strong></p>
      <p>Enter this code to verify your account.</p>
      <p>⚠️ Never share your OTP with anyone.</p>
      <p>This OTP will expire in 5 minutes.</p>
      <p>With love,<br/>Team JusT us ❤️</p>
    `,
  });

  return true;
};

export const verifyOtp = async (contact: string, otp: string): Promise<boolean> => {
  const { data: existingOtp, error } = await supabase
    .from('otp_codes')
    .select('*')
    .eq('contact', contact)
    .eq('code', otp)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!existingOtp || error) return false;

  if (new Date(existingOtp.expires_at) < new Date()) {
    return false;
  }

  // consume OTP
  await supabase.from('otp_codes').delete().eq('id', existingOtp.id);

  return true;
};

export default {
  sendOtp,
  verifyOtp,
};
