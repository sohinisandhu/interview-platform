const express = require("express");
const { transcribe } = require("../controllers/speech.controller");
const { uploadAudio } = require("../middleware/upload.middleware");
const { protect } = require("../middleware/auth.middleware");
const router = express.Router();
router.post("/transcribe", protect, uploadAudio.single("audio"), transcribe);
module.exports = router;
