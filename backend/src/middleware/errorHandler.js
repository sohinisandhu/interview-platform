const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} — ${err.message}`);

  if (err.name === "ValidationError") {
    const msgs = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: msgs.join(", ") });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ error: `${field} already exists.` });
  }
  if (err.name === "JsonWebTokenError") return res.status(401).json({ error: "Invalid token." });
  if (err.name === "TokenExpiredError") return res.status(401).json({ error: "Token expired.", code: "TOKEN_EXPIRED" });
  if (err.code === "LIMIT_FILE_SIZE") return res.status(400).json({ error: "File too large." });
  if (err.type === "entity.too.large") return res.status(413).json({ error: "Request too large." });

  // OpenAI errors
  if (err?.status === 429) return res.status(429).json({ error: "AI rate limit hit. Please wait a moment." });
  if (err?.status === 401) return res.status(500).json({ error: "AI service authentication failed." });

  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    error: err.message || "Internal server error.",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
