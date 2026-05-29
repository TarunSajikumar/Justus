require("dotenv").config();

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendTestMail() {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "JusT us Test ❤️",
      html: `
        💌 Welcome to JusT us
        Email configuration is working successfully.
      `,
    });

    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error(error);
  }
}

sendTestMail();
