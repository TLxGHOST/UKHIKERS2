import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

import Blog from "./models/Blog.js";
import TrekSlot from "./models/TrekSlot.js";
import Booking from "./models/Booking.js";
import Payment from "./models/Payment.js";
import Review from "./models/Review.js";
import Admin from "./models/Admin.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ukhikers";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ DB connection error:", error.message);
    process.exit(1);
  }
};

const clearDatabase = async () => {
  console.log("🗑️  Clearing existing data...");
  await Blog.deleteMany();
  await TrekSlot.deleteMany();
  await Booking.deleteMany();
  await Payment.deleteMany();
  await Review.deleteMany();
  await Admin.deleteMany();  // ✅ ADD THIS LINE
  console.log("✅ All collections cleared");
};

const seedTreks = async () => {
  const treks = await Blog.insertMany([
    {
      title: "Chopta Tungnath Trek",
      excerpt: "Mini Switzerland of Uttarakhand – trek to the world's highest Shiva temple at 13,000 ft.",
      imageUrl: "/assets/images/blog/chopta.jpg",
      price: 3500,
      duration: "3 days",
      difficulty: "moderate",
      location: "Uttarakhand",
      tags: ["trekking", "uttarakhand", "himalaya", "temple"],
      content: [
        { type: "paragraph", text: "Nestled in the heart of Uttarakhand, the Chopta Tungnath trek is often referred to as the 'Mini Switzerland of India.' This breathtaking journey takes you through pristine meadows, dense forests, and ultimately to the highest Shiva temple in the world at 13,000 feet." },
        { type: "heading", text: "Why Choose Chopta Tungnath Trek?" },
        { type: "paragraph", text: "The trail winds through rhododendron forests that bloom magnificently in spring, creating a carpet of vibrant colors against the backdrop of snow-capped peaks." },
        { type: "subheading", text: "Best Time to Visit" },
        { type: "paragraph", text: "The ideal time for this trek is from April to June and September to November." },
        { type: "list", items: ["Distance: 5 km one way", "Duration: 3-4 hours ascent", "Difficulty: Moderate", "Best season: April-June, Sept-Nov"] }
      ]
    },
    {
      title: "Valley of Flowers Trek",
      excerpt: "UNESCO World Heritage site filled with exotic alpine flowers and breathtaking mountain vistas.",
      imageUrl: "/assets/images/blog/valley-of-flowers.jpg",
      price: 4500,
      duration: "6 days",
      difficulty: "moderate",
      location: "Uttarakhand",
      tags: ["trekking", "flowers", "unesco", "photography"],
      content: [
        { type: "paragraph", text: "The Valley of Flowers National Park transforms into a vibrant carpet of alpine flowers during the monsoon season. It is a paradise for nature lovers and photographers." },
        { type: "heading", text: "When to Visit" },
        { type: "paragraph", text: "The valley is open from June to October, with peak blooming season from mid-July to mid-August." }
      ]
    },
    {
      title: "Kedarkantha Winter Trek",
      excerpt: "Experience the magic of winter trekking with snow-covered trails and stunning Himalayan views.",
      imageUrl: "/assets/images/blog/winter.jpg",
      price: 5500,
      duration: "5 days",
      difficulty: "moderate to difficult",
      location: "Uttarakhand",
      tags: ["winter", "trekking", "snow", "himalaya"],
      content: [
        { type: "paragraph", text: "Kedarkantha is one of the most popular winter treks in India, offering pristine snow trails and panoramic views of the Himalayan peaks." },
        { type: "heading", text: "Winter Wonderland" },
        { type: "paragraph", text: "During winter months (December to March), the entire trail is covered in snow, making it a true winter wonderland." }
      ]
    },
    {
      title: "Har Ki Dun Trek",
      excerpt: "Explore the ancient valley of Har Ki Dun with its rich mythological history and breathtaking landscapes.",
      imageUrl: "/assets/images/blog/hiking1.jpg",
      price: 6500,
      duration: "7 days",
      difficulty: "moderate",
      location: "Uttarakhand",
      tags: ["trekking", "mythology", "valley", "himalaya"],
      content: [
        { type: "paragraph", text: "Har Ki Dun, also known as the 'Valley of Gods,' is one of the most beautiful treks in the Garhwal Himalayas. This cradle-shaped valley is surrounded by snow-capped peaks." }
      ]
    },
    {
      title: "Roopkund Trek (Mystery Lake)",
      excerpt: "Famous for the skeletal remains at the edge of a frozen lake, this trek is a thrilling adventure for history buffs.",
      imageUrl: "/assets/images/blog/hiking3.jpg",
      price: 7500,
      duration: "8 days",
      difficulty: "difficult",
      location: "Uttarakhand",
      tags: ["trekking", "mystery", "lake", "himalaya"],
      content: [
        { type: "paragraph", text: "Roopkund is a high-altitude glacial lake known for the hundreds of ancient human skeletons found at its edge. The trek offers stunning views of Trishul and Nanda Ghunti peaks." }
      ]
    }
  ]);

  console.log(`✅ Created ${treks.length} treks`);
  return treks;
};

const seedSlots = async (treks) => {
  const slots = await TrekSlot.insertMany([
    // Chopta Tungnath (treks[0])
    { trekId: treks[0]._id, date: new Date("2026-06-10"), totalSeats: 20, bookedSeats: 3 },
    { trekId: treks[0]._id, date: new Date("2026-06-25"), totalSeats: 20, bookedSeats: 0 },
    { trekId: treks[0]._id, date: new Date("2026-07-15"), totalSeats: 20, bookedSeats: 0 },
    // Valley of Flowers (treks[1])
    { trekId: treks[1]._id, date: new Date("2026-07-20"), totalSeats: 25, bookedSeats: 5 },
    { trekId: treks[1]._id, date: new Date("2026-08-05"), totalSeats: 25, bookedSeats: 0 },
    // Kedarkantha (treks[2])
    { trekId: treks[2]._id, date: new Date("2026-12-15"), totalSeats: 15, bookedSeats: 8 },
    { trekId: treks[2]._id, date: new Date("2027-01-10"), totalSeats: 15, bookedSeats: 0 },
    // Har Ki Dun (treks[3])
    { trekId: treks[3]._id, date: new Date("2026-09-01"), totalSeats: 20, bookedSeats: 2 },
    // Roopkund (treks[4])
    { trekId: treks[4]._id, date: new Date("2026-08-20"), totalSeats: 12, bookedSeats: 0 },
    { trekId: treks[4]._id, date: new Date("2026-09-10"), totalSeats: 12, bookedSeats: 0 }
  ]);

  console.log(`✅ Created ${slots.length} slots`);
  return slots;
};

const seedBookings = async (treks, slots) => {
  const bookings = await Booking.insertMany([
    {
      name: "Aman Sharma",
      email: "aman@example.com",
      phone: "9999999999",
      persons: 2,
      trekId: treks[0]._id,
      slotId: slots[0]._id,
      totalAmount: 7000,
      amountPaid: 3500,
      amountRemaining: 3500,
      paymentStatus: "partial",
      bookingStatus: "approved"
    },
    {
      name: "Riya Patel",
      email: "riya@example.com",
      phone: "8888888888",
      persons: 1,
      trekId: treks[1]._id,
      slotId: slots[3]._id,
      totalAmount: 4500,
      amountPaid: 4500,
      amountRemaining: 0,
      paymentStatus: "paid",
      bookingStatus: "approved"
    },
    {
      name: "Vikram Singh",
      email: "vikram@example.com",
      phone: "7777777777",
      persons: 3,
      trekId: treks[2]._id,
      slotId: slots[5]._id,
      totalAmount: 16500,
      amountPaid: 5000,
      amountRemaining: 11500,
      paymentStatus: "partial",
      bookingStatus: "pending"
    },
    {
      name: "Priya Gupta",
      email: "priya@example.com",
      phone: "6666666666",
      persons: 2,
      trekId: treks[3]._id,
      slotId: slots[7]._id,
      totalAmount: 13000,
      amountPaid: 0,
      amountRemaining: 13000,
      paymentStatus: "pending",
      bookingStatus: "pending"
    },
    {
      name: "Neha Verma",
      email: "neha@example.com",
      phone: "5555555555",
      persons: 2,
      trekId: treks[4]._id,
      slotId: slots[8]._id,
      totalAmount: 15000,
      amountPaid: 7500,
      amountRemaining: 7500,
      paymentStatus: "partial",
      bookingStatus: "approved"
    }
  ]);

  console.log(`✅ Created ${bookings.length} bookings`);
  return bookings;
};

const seedPayments = async (bookings) => {
  const payments = await Payment.insertMany([
    {
      bookingId: bookings[0]._id,
      amount: 3500,
      paymentType: "advance",
      paymentMethod: "razorpay",
      status: "success"
    },
    {
      bookingId: bookings[1]._id,
      amount: 4500,
      paymentType: "full",
      paymentMethod: "razorpay",
      status: "success"
    },
    {
      bookingId: bookings[2]._id,
      amount: 5000,
      paymentType: "advance",
      paymentMethod: "cash",
      status: "success"
    },
    {
      bookingId: bookings[4]._id,
      amount: 7500,
      paymentType: "advance",
      paymentMethod: "upi",
      status: "success"
    }
  ]);

  console.log(`✅ Created ${payments.length} payments`);
  return payments;
};

const seedReviews = async (bookings, treks) => {
  const reviews = await Review.insertMany([
    {
      bookingId: bookings[0]._id,      // Aman's approved booking
      trekId: treks[0]._id,
      userName: "Aman Sharma",
      rating: 5,
      comment: "Amazing experience! The views were breathtaking and the guides were very supportive.",
      images: [],
      status: "approved",
      adminNotes: ""
    },
    {
      bookingId: bookings[1]._id,      // Riya's approved booking
      trekId: treks[1]._id,
      userName: "Riya Patel",
      rating: 4,
      comment: "Beautiful flowers everywhere! Only downside was the weather, but the trek organizer handled it well.",
      images: [],
      status: "approved",
      adminNotes: ""
    },
    {
      bookingId: bookings[4]._id,      // Neha's approved booking (Roopkund)
      trekId: treks[4]._id,
      userName: "Neha Verma",
      rating: 5,
      comment: "Tough but rewarding. The mystery lake is surreal. Highly recommended for experienced trekkers.",
      images: [],
      status: "pending",    // pending approval
      adminNotes: ""
    }
  ]);

  console.log(`✅ Created ${reviews.length} reviews (1 pending approval)`);
  return reviews;
};

const seedAdminUser = async () => {
  const adminName = "TLxGHOST";
  const adminEmail = "btejanshu@gmail.com@gmail.com";
  const adminPassword = "karharmaidanFateh@0911";

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const usersCollection = mongoose.connection.collection("users");
  await usersCollection.updateOne(
    { email: adminEmail },
    {
      $set: {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: "Superadmin"
      }
    },
    { upsert: true }
  );

  console.log(`✅ Admin user seeded from .env (${adminEmail})`);
};

const runSeeder = async () => {
  try {
    await connectDB();
    await clearDatabase();
    const treks = await seedTreks();
    const slots = await seedSlots(treks);
    const bookings = await seedBookings(treks, slots);
    await seedPayments(bookings);
    await seedReviews(bookings, treks);
    await seedAdminUser();
    console.log("\n🎉 Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

runSeeder();
