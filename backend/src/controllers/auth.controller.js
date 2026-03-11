const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { generateTokens } = require("../middleware/auth.middleware");

// POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "All fields required." });
  if (password.length < 6) return res.status(400).json({ error: "Password min 6 characters." });

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ error: "Email already registered." });

  const user = await User.create({ name, email, password });
  const { accessToken, refreshToken } = generateTokens(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.status(201).json({ accessToken, refreshToken, user });
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required." });

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Remove password from response
  user.password = undefined;
  res.json({ accessToken, refreshToken, user });
};

// POST /api/auth/refresh
const refreshTokens = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: "Refresh token required." });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: "Invalid refresh token." });
    }
    const tokens = generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save({ validateBeforeSave: false });
    res.json(tokens);
  } catch {
    res.status(401).json({ error: "Invalid or expired refresh token." });
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  req.user.refreshToken = null;
  await req.user.save({ validateBeforeSave: false });
  res.json({ message: "Logged out successfully." });
};

// GET /api/auth/me
const getMe = (req, res) => res.json({ user: req.user });

// PATCH /api/auth/preferences
const updatePreferences = async (req, res) => {
  const { defaultMode, questionsPerSession } = req.body;
  if (defaultMode) req.user.preferences.defaultMode = defaultMode;
  if (questionsPerSession) req.user.preferences.questionsPerSession = questionsPerSession;
  await req.user.save();
  res.json({ user: req.user });
};

module.exports = { register, login, refreshTokens, logout, getMe, updatePreferences };
