import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,               // Use SSL port instead of 587
  secure: true,            // true for 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  family: 4,               // Force IPv4 (critical for Render)
  tls: {
    rejectUnauthorized: false,  // optional for self-signed, but keep
  },
  connectionTimeout: 10000,     // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

export default transporter;