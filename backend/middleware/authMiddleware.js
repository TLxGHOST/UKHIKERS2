import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Re-read the admin on every protected request so deactivated accounts and
    // changed roles take effect immediately instead of trusting stale JWT claims.
    if (!decoded?.id) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const admin = await Admin.findById(decoded.id).select("_id name email role isActive");
    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: "Admin account is inactive or unavailable" });
    }

    req.user = {
      id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      role: admin.role
    };
    return next();
  } catch (err) {
    if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    return res.status(500).json({ message: "Unable to authenticate request" });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient permissions" });
    }
    return next();
  };
};
