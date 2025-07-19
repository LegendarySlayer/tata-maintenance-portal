// authMiddleware.js

import jwt from 'jsonwebtoken';

// ❌ The two lines for 'dotenv' have been removed from here.

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.warn("❌ No token found in authorization header.");
    return res.status(401).json({ message: "Access denied. Token missing." });
  }

  try {
        // ✅ ADD THIS DEBUG LINE
    console.log("Auth Middleware - Verifying with secret:", process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};