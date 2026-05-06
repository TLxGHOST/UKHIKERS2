/// havent created the registration so this can be used to change password jus fill new credentials and node adminseed.js but it will delete all preexisiting one to avoid those comment the line deleteMany()
import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import Admin from "./models/Admin.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    await Admin.deleteMany();

    const admin = await Admin.create({
      name: "Deepanshu",
      email: "ukhikers@gmail.com",
      password: "adminUKhikers",
      role: "super_admin",
    });

    console.log("✅ Admin Created:");
    console.log(admin.email);

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedAdmin();