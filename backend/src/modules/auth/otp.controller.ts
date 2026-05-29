import { Request, Response } from "express";
import { sendOtp, verifyOtp } from "./otp.service";

export const sendOtpController = async (req: Request, res: Response) => {
  try {
    await sendOtp(req.body.email);
    res.json({ message: "OTP sent" });
  } catch (err) {
    const e: any = err;
    const status = e?.status || 500;
    const message = e?.message || (err as Error).message || "Failed to send OTP";
    res.status(status).json({ error: message });
  }
};

export const verifyOtpController = async (req: Request, res: Response) => {
  try {
    const valid = await verifyOtp(req.body.email, req.body.otp);
    res.json({ valid });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message || "Failed to verify OTP" });
  }
};
