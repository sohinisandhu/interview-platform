const fs = require("fs");
const { transcribeAudio } = require("../services/openai.service");

// POST /api/speech/transcribe
const transcribe = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No audio file uploaded." });

  try {
    const result = await transcribeAudio(req.file.path);
    fs.existsSync(req.file.path) && fs.unlinkSync(req.file.path);

    if (!result.text?.trim()) {
      return res.status(422).json({ error: "No speech detected. Speak clearly and try again." });
    }

    res.json({
      transcript: result.text.trim(),
      duration: result.duration,
      language: result.language,
      wordCount: result.text.split(/\s+/).filter(Boolean).length,
    });
  } catch (err) {
    fs.existsSync(req.file?.path) && fs.unlinkSync(req.file.path);
    throw err;
  }
};

module.exports = { transcribe };
