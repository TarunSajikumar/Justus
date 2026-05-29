import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

export const login = async (req: Request, res: Response) => {
  const { phone } = req.body;
  // Here you would usually generate an OTP and send it via SMS
  console.log(`Sending OTP to ${phone}`);
  res.json({ message: 'OTP sent successfully' });
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { phone, otp } = req.body;

  // For demo, we accept '123456' as valid OTP
  if (otp === '123456') {
    const user = { id: '1', phone, name: 'User', partnerId: '2' }; // Mock user
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user });
  } else {
    res.status(400).json({ message: 'Invalid OTP' });
  }
};

export const getProfile = async (req: any, res: Response) => {
  // In real app, fetch from DB using req.user.userId
  const user = { id: '1', phone: '+911234567890', name: 'Alex', partnerId: '2' };
  res.json(user);
};
