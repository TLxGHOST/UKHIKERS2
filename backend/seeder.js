import mongoose from "mongoose";
import dotenv from "dotenv";

import Blog from "./models/Blog.js";
import TrekSlot from "./models/TrekSlot.js";
import Booking from "./models/Booking.js";
import Payment from "./models/Payment.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

console.log("DB connected 🌿");

// 🔥 CLEAR OLD DATA
await Blog.deleteMany();
await TrekSlot.deleteMany();
await Booking.deleteMany();
await Payment.deleteMany();

console.log("Old data cleared");

// 🏔 CREATE TREKS (BLOGS)
const treks = await Blog.insertMany([
  {
    title: "Kedarkantha Trek",
    price: 5000
  },
  {
    title: "Valley of Flowers",
    price: 7000
  }
]);

// 📅 CREATE SLOTS
const slots = await TrekSlot.insertMany([
  {
    trekId: treks[0]._id,
    date: new Date("2026-06-10"),
    totalSeats: 20,
    bookedSeats: 5
  },
  {
    trekId: treks[1]._id,
    date: new Date("2026-07-15"),
    totalSeats: 25,
    bookedSeats: 10
  }
]);

// 🧾 CREATE BOOKINGS
const bookings = await Booking.insertMany([
  {
    name: "Aman",
    email: "aman@test.com",
    phone: "9999999999",
    persons: 2,
    trekId: treks[0]._id,
    slotId: slots[0]._id,
    totalAmount: 10000,
    amountPaid: 5000,
    amountRemaining: 5000,
    paymentStatus: "partial",
    bookingStatus: "approved"
  },
  {
    name: "Riya",
    email: "riya@test.com",
    phone: "8888888888",
    persons: 1,
    trekId: treks[1]._id,
    slotId: slots[1]._id,
    totalAmount: 7000,
    amountPaid: 7000,
    amountRemaining: 0,
    paymentStatus: "paid",
    bookingStatus: "approved"
  }
]);

// 💳 CREATE PAYMENTS
await Payment.insertMany([
  {
    bookingId: bookings[0]._id,
    amount: 5000,
    paymentType: "advance"
  },
  {
    bookingId: bookings[1]._id,
    amount: 7000,
    paymentType: "full"
  }
]);

console.log("Seeding complete 🌄");

process.exit();