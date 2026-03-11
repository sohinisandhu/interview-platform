const jwt = require("jsonwebtoken");
const { User } = require("../models");

const protect = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required." });
  }
  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(401).json({ error: "User not found." });
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired.", code: "TOKEN_EXPIRED" });
    }
    return res.status(401).json({ error: "Invalid token." });
  }
};

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });
  return { accessToken, refreshToken };
};

module.exports = { protect, generateTokens };
