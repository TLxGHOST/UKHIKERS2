import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const port = Number(process.env.EMAIL_PORT || 587);
const host = process.env.EMAIL_HOST?.trim();
const hasCredentials = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

// Use the SMTP server configured by the deployment environment. Do not assume
// a specific vendor; this works with Gmail, Outlook, and hosting-provider SMTP.
const transporter = nodemailer.createTransport({
  ...(host ? { host } : {}),
  port,
  secure: port === 465,
  ...(hasCredentials ? {
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  } : {}),
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000,
});

export default transporter;
