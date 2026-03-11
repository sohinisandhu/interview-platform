const multer = require("multer");
const path = require("path");
const fs = require("fs");

const ensureDir = (dir) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };

// ─── Resume Upload ─────────────────────────────────────────────────────────────
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), "uploads/resumes");
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `resume-${req.user._id}-${Date.now()}${ext}`);
  },
});

const resumeFilter = (req, file, cb) => {
  const allowed = [".pdf", ".txt", ".doc", ".docx"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error("Only PDF, TXT, DOC files allowed."), false);
};

const uploadResume = multer({
  storage: resumeStorage,
  fileFilter: resumeFilter,
  limits: { fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024 },
});

// ─── Audio Upload ──────────────────────────────────────────────────────────────
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), "uploads/audio");
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `audio-${req.user._id}-${Date.now()}.webm`);
  },
});

const audioFilter = (req, file, cb) => {
  const ok = file.mimetype.startsWith("audio/") || file.mimetype.startsWith("video/webm");
  if (ok) cb(null, true);
  else cb(new Error("Unsupported audio format."), false);
};

const uploadAudio = multer({
  storage: audioStorage,
  fileFilter: audioFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB Whisper limit
});

module.exports = { uploadResume, uploadAudio };
