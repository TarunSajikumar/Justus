import express from "express";

import {
sendOtpController,
verifyOtpController
} from "./otp.controller";

const router = express.Router();

router.post(
"/send",
sendOtpController
);

router.post(
"/verify",
verifyOtpController
);

export default router;
