import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import Blog from "../models/Blog.js";

const safeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  wishlist: (user.wishlist || []).map((item) => item?._id ? item._id.toString() : item.toString()),
  preferences: user.preferences || { preferredDifficulties: [], interests: [] },
});

const issueToken = (user) => jwt.sign(
  { id: user._id.toString(), type: "customer" },
  process.env.JWT_SECRET,
  { expiresIn: "7d" },
);

const validEmail = (email) =>
  typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100 ||
        !validEmail(email) || typeof password !== "string" || password.length < 8 || password.length > 128) {
      return res.status(400).json({ success: false, message: "Provide a name, valid email, and password between 8 and 128 characters." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({ success: false, message: "An account with this email already exists. Please sign in." });
    }

    const user = await User.create({ name: name.trim(), email: normalizedEmail, password });
    return res.status(201).json({
      success: true,
      token: issueToken(user),
      user: safeUser(user),
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: "An account with this email already exists. Please sign in." });
    }
    console.error("Customer registration failed:", error);
    return res.status(500).json({ success: false, message: "Unable to create account right now." });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!validEmail(email) || typeof password !== "string" || password.length === 0 || password.length > 128) {
      return res.status(400).json({ success: false, message: "Enter a valid email and password." });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase(), isActive: true }).select("+password");
    if (!user || !user.password || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    return res.json({ success: true, token: issueToken(user), user: safeUser(user) });
  } catch (error) {
    console.error("Customer login failed:", error);
    return res.status(500).json({ success: false, message: "Unable to sign in right now." });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.customer._id).populate("wishlist", "title imageUrl price duration difficulty location excerpt");
    if (!user) return res.status(404).json({ success: false, message: "Customer account not found." });
    return res.json({
      success: true,
      user: {
        ...safeUser(user),
        wishlist: (user.wishlist || []).map((trek) => trek && typeof trek === "object" && trek._id
          ? { _id: trek._id.toString(), title: trek.title, imageUrl: trek.imageUrl, price: trek.price, duration: trek.duration, difficulty: trek.difficulty, location: trek.location, excerpt: trek.excerpt }
          : trek),
      },
    });
  } catch (error) {
    console.error("Fetching customer account failed:", error);
    return res.status(500).json({ success: false, message: "Unable to load your account." });
  }
};

export const addWishlistItem = async (req, res) => {
  const { trekId } = req.params;
  if (!mongoose.isValidObjectId(trekId)) {
    return res.status(400).json({ success: false, message: "Invalid trek ID." });
  }
  try {
    const trekExists = await Blog.exists({ _id: trekId });
    if (!trekExists) return res.status(404).json({ success: false, message: "Trek not found." });

    await User.updateOne({ _id: req.customer._id }, { $addToSet: { wishlist: trekId } });
    const user = await User.findById(req.customer._id).select("wishlist");
    return res.json({ success: true, wishlist: user.wishlist.map(String) });
  } catch (error) {
    console.error("Adding wishlist item failed:", error);
    return res.status(500).json({ success: false, message: "Unable to update wishlist." });
  }
};

export const removeWishlistItem = async (req, res) => {
  const { trekId } = req.params;
  if (!mongoose.isValidObjectId(trekId)) {
    return res.status(400).json({ success: false, message: "Invalid trek ID." });
  }
  try {
    await User.updateOne({ _id: req.customer._id }, { $pull: { wishlist: trekId } });
    const user = await User.findById(req.customer._id).select("wishlist");
    return res.json({ success: true, wishlist: user.wishlist.map(String) });
  } catch (error) {
    console.error("Removing wishlist item failed:", error);
    return res.status(500).json({ success: false, message: "Unable to update wishlist." });
  }
};

export const updatePreferences = async (req, res) => {
  const { preferredDifficulties, interests } = req.body || {};
  const allowedDifficulties = ["easy", "moderate", "difficult"];
  if (preferredDifficulties !== undefined &&
      (!Array.isArray(preferredDifficulties) || preferredDifficulties.some((value) => !allowedDifficulties.includes(value)))) {
    return res.status(400).json({ success: false, message: "Preferred difficulties must contain only easy, moderate, or difficult." });
  }
  if (interests !== undefined &&
      (!Array.isArray(interests) || interests.length > 20 ||
       interests.some((value) => typeof value !== "string" || value.trim().length < 1 || value.trim().length > 50))) {
    return res.status(400).json({ success: false, message: "Interests must be a list of up to 20 short text values." });
  }

  try {
    const update = {};
    if (preferredDifficulties !== undefined) update["preferences.preferredDifficulties"] = [...new Set(preferredDifficulties)];
    if (interests !== undefined) update["preferences.interests"] = [...new Set(interests.map((value) => value.trim()))];
    const user = await User.findByIdAndUpdate(req.customer._id, { $set: update }, { new: true }).select("name email wishlist preferences");
    return res.json({ success: true, user: safeUser(user) });
  } catch (error) {
    console.error("Updating customer preferences failed:", error);
    return res.status(500).json({ success: false, message: "Unable to save preferences." });
  }
};
