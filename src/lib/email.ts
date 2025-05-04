// external imports
import nodemailer from "nodemailer";

// internal import
import { genTemplateForOtp } from "../utils/htmlFormat";

// create transposter
async function createTransporter() {
  const transporter = nodemailer.createTransport({
    host: process.env.GMAIL_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASS,
    },
  });

  try {
    await transporter.verify();
    console.log("✅ Transporter is verified and ready to send emails.");
    return transporter;
  } catch (error) {
    console.error("❌ Transporter verification failed:", error);
    return null;
  }
}

async function sendOTP(
  recieverEmail: string,
  otp: string
): Promise<string | null> {
  const transporter = await createTransporter();
  if (!transporter) {
    console.log("Cannot send email, transporter not available.");
    return null;
  }

  const info = await transporter.sendMail({
    from: `"CRANET 👻" <${process.env.GMAIL_USER}>`, // fixed: added angle brackets
    to: recieverEmail,
    subject: "🔐 Your OTP Code for Password Reset",
    text: `Your OTP code is: ${otp}`, // fallback for plain email clients
    html: genTemplateForOtp(otp),
  });

  return info.messageId;
}

export default {
  sendOTP,
};
