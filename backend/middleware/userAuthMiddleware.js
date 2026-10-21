import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }

  try {
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded?.type !== "customer" || !decoded?.id) {
      return res.status(401).json({ success: false, message: "Invalid customer token." });
    }

    const user = await User.findById(decoded.id).select("_id name email wishlist preferences isActive");
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "Customer account is inactive or unavailable." });
    }

    req.customer = user;
    return next();
  } catch (error) {
    if (["JsonWebTokenError", "TokenExpiredError"].includes(error?.name)) {
      return res.status(401).json({ success: false, message: "Invalid or expired token." });
    }
    return res.status(500).json({ success: false, message: "Unable to authenticate request." });
  }
};
