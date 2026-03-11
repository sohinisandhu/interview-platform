const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const { Resume } = require("../models");
const openaiService = require("../services/openai.service");

// ─── Parse file content ────────────────────────────────────────────────────────
const parseFile = async (filePath, mimetype, originalName) => {
  const ext = path.extname(originalName).toLowerCase();
  if (ext === ".pdf" || mimetype === "application/pdf") {
    const buf = fs.readFileSync(filePath);
    const data = await pdfParse(buf);
    return data.text;
  }
  return fs.readFileSync(filePath, "utf-8");
};

// POST /api/resume/upload
const uploadAndParse = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded." });

  let parsedText;
  try {
    parsedText = await parseFile(req.file.path, req.file.mimetype, req.file.originalname);
  } catch (err) {
    fs.existsSync(req.file.path) && fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: "Could not parse file. Try a text-based PDF." });
  }

  if (!parsedText || parsedText.trim().length < 50) {
    fs.existsSync(req.file.path) && fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: "Resume text too short. Please upload a proper resume." });
  }

  const resume = await Resume.create({
    userId: req.user._id,
    originalName: req.file.originalname,
    filename: req.file.filename,
    parsedText: parsedText.slice(0, 8000),
    wordCount: parsedText.split(/\s+/).filter(Boolean).length,
  });

  res.status(201).json({
    resumeId: resume._id,
    originalName: resume.originalName,
    wordCount: resume.wordCount,
    preview: parsedText.slice(0, 300) + "...",
  });
};

// POST /api/resume/analyze
const analyzeResume = async (req, res) => {
  const { resumeId, jobDescription, jobRole } = req.body;

  if (!resumeId || !jobDescription || !jobRole) {
    return res.status(400).json({ error: "resumeId, jobDescription, and jobRole required." });
  }

  const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
  if (!resume) return res.status(404).json({ error: "Resume not found." });

  const analysis = await openaiService.analyzeResumeVsJD({
    resumeText: resume.parsedText,
    jobDescription,
    jobRole,
  });

  // Save analysis to resume
  resume.analyses.push({
    jobRole,
    jobDescription: jobDescription.slice(0, 2000),
    overallScore: analysis.overall_score,
    jdMatchScore: analysis.jd_match_score,
    skillScores: analysis.skill_scores,
    matchedSkills: analysis.matched_skills,
    missingSkills: analysis.missing_skills,
    strengths: analysis.strengths,
    improvementAreas: analysis.improvement_areas,
    atsTips: analysis.ats_tips,
    interviewFocusAreas: analysis.interview_focus_areas,
  });
  await resume.save();

  res.json({ analysis, resumeId: resume._id });
};

// GET /api/resume
const getUserResumes = async (req, res) => {
  const resumes = await Resume.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .select("originalName wordCount analyses createdAt")
    .limit(10);
  res.json({ resumes });
};

// GET /api/resume/:id
const getResume = async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
  if (!resume) return res.status(404).json({ error: "Resume not found." });
  res.json({ resume });
};

// DELETE /api/resume/:id
const deleteResume = async (req, res) => {
  const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!resume) return res.status(404).json({ error: "Resume not found." });
  // Delete file
  const filePath = path.join(process.cwd(), "uploads/resumes", resume.filename || "");
  if (resume.filename && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  res.json({ message: "Resume deleted." });
};

module.exports = { uploadAndParse, analyzeResume, getUserResumes, getResume, deleteResume };
