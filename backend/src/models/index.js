const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ─── User ───────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  avatar: { type: String, default: null },

  stats: {
    totalInterviews: { type: Number, default: 0 },
    avgScore: { type: Number, default: 0 },
    bestScore: { type: Number, default: 0 },
    totalHours: { type: Number, default: 0 },
  },

  preferences: {
    defaultMode: { type: String, enum: ["video", "audio", "test"], default: "test" },
    questionsPerSession: { type: Number, default: 5 },
  },

  refreshToken: { type: String, select: false },
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};

// ─── Resume ─────────────────────────────────────────
const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  originalName: { type: String, required: true },
  filename: { type: String },

  parsedText: { type: String, required: true },
  wordCount: { type: Number },

  extractedData: {
    skills: [String],
    experience: String,
    education: String,
    summary: String,
  },

  analyses: [{
    jobRole: String,
    jobDescription: String,
    overallScore: Number,
    jdMatchScore: Number,
    skillScores: mongoose.Schema.Types.Mixed,

    matchedSkills: [String],
    missingSkills: [String],

    strengths: [String],
    improvementAreas: [String],
    atsTips: [String],

    interviewFocusAreas: [String],

    analyzedAt: { type: Date, default: Date.now },
  }],

}, { timestamps: true });


// ─── Answer Schema ──────────────────────────────────
const answerSchema = new mongoose.Schema({

  questionId: String,
  question: String,

  questionType: String,
  difficulty: String,
  category: String,

  answerText: String,
  audioUrl: String,

  timeTakenSeconds: { type: Number, default: 0 },

  feedback: {
    score: Number,
    grade: String,

    strengths: [String],
    improvements: [String],
    missedPoints: [String],

    idealAnswer: String,

    deliveryScore: Number,
    clarityScore: Number,

    overallComment: String,
  }

});


// ─── Interview Session ──────────────────────────────
const interviewSessionSchema = new mongoose.Schema({

  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: "Resume" },

  jobRole: { type: String, required: true },
  jobDescription: String,

  mode: { type: String, enum: ["video", "audio", "test"], required: true },

  status: {
    type: String,
    enum: ["in_progress", "completed", "abandoned"],
    default: "in_progress",
    index: true
  },

  resumeAnalysis: {
    overallScore: Number,
    jdMatchScore: Number,

    matchedSkills: [String],
    missingSkills: [String],

    interviewFocusAreas: [String],
  },

  questions: { type: mongoose.Schema.Types.Mixed, default: [] },

  answers: [answerSchema],

  report: {

    overallScore: Number,
    grade: String,
    hireRecommendation: String,

    executiveSummary: String,

    topStrengths: [String],
    criticalGaps: [String],

    questionScores: [Number],

    skillBreakdown: {
      technical: Number,
      communication: Number,
      problemSolving: Number,
      experience: Number,
    },

    actionPlan: [{
      priority: String,
      action: String,
      timeline: String,
    }],

    resources: [{
      topic: String,
      type: String,
      suggestion: String,
    }]

  },

  durationMinutes: Number,

  startedAt: { type: Date, default: Date.now },
  completedAt: Date,

}, { timestamps: true });


// ─── Models ─────────────────────────────────────────
const User = mongoose.model("User", userSchema);
const Resume = mongoose.model("Resume", resumeSchema);
const InterviewSession = mongoose.model("InterviewSession", interviewSessionSchema);

module.exports = {
  User,
  Resume,
  InterviewSession
};