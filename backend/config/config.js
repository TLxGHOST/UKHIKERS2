import dotenv from "dotenv";

dotenv.config();

export const config = {
  PORT: process.env.PORT || 5000,

  MONGO_URI:
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/ukhikers",

  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,

  JWT_SECRET: process.env.JWT_SECRET,
};