const { InterviewSession } = require("../models");

// GET /api/history
const getHistory = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(20, parseInt(req.query.limit) || 10);
  const mode = req.query.mode;
  const skip = (page - 1) * limit;

  const filter = { userId: req.user._id, status: "completed" };
  if (mode) filter.mode = mode;

  const [sessions, total] = await Promise.all([
    InterviewSession.find(filter)
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("jobRole mode report.overallScore report.grade report.hireRecommendation completedAt durationMinutes answers"),
    InterviewSession.countDocuments(filter),
  ]);

  res.json({ sessions, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
};

// GET /api/history/stats
const getStats = async (req, res) => {
  const sessions = await InterviewSession.find({ userId: req.user._id, status: "completed" })
    .select("jobRole mode report.overallScore completedAt durationMinutes")
    .sort({ completedAt: 1 });

  if (!sessions.length) {
    return res.json({ totalInterviews: 0, avgScore: 0, bestScore: 0, improvement: 0, modeBreakdown: {}, recentTrend: [] });
  }

  const scores = sessions.map((s) => s.report?.overallScore || 0);
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const bestScore = Math.max(...scores);

  // Improvement: compare first 3 vs last 3
  const first3 = scores.slice(0, 3).reduce((a, b) => a + b, 0) / Math.min(3, scores.length);
  const last3 = scores.slice(-3).reduce((a, b) => a + b, 0) / Math.min(3, scores.length);
  const improvement = Math.round(last3 - first3);

  // Mode breakdown
  const modeBreakdown = sessions.reduce((acc, s) => {
    acc[s.mode] = (acc[s.mode] || 0) + 1;
    return acc;
  }, {});

  // Recent trend (last 7 sessions for chart)
  const recentTrend = sessions.slice(-7).map((s) => ({
    date: s.completedAt?.toISOString().split("T")[0],
    score: s.report?.overallScore || 0,
    jobRole: s.jobRole,
    mode: s.mode,
  }));

  res.json({ totalInterviews: sessions.length, avgScore, bestScore, improvement, modeBreakdown, recentTrend, user: req.user.stats });
};

// GET /api/history/:sessionId
const getSessionDetail = async (req, res) => {
  const session = await InterviewSession.findOne({ _id: req.params.sessionId, userId: req.user._id });
  if (!session) return res.status(404).json({ error: "Session not found." });
  res.json({ session });
};

module.exports = { getHistory, getStats, getSessionDetail };
