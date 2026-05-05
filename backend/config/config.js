import dotenv from "dotenv";

dotenv.config();

export const config = {
  PORT: process.env.PORT || 5000,

  MONGO_URI:
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/ukhikers",

  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@gmail.com",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "123456",

  JWT_SECRET: process.env.JWT_SECRET || "supersecretkey"
};