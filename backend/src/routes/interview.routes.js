const express = require("express");
const router = express.Router();

const {
  startInterview,
  submitAnswer,
  finishInterview,
  getInterview
} = require("../controllers/interview.controller");

const { protect } = require("../middleware/auth.middleware");

// Start interview
router.post("/start", protect, startInterview);

// Submit answer - matches frontend: /interview/:sessionId/answer
router.post("/:sessionId/answer", protect, submitAnswer);

// Finish interview - matches frontend: /interview/:sessionId/complete
router.post("/:sessionId/complete", protect, finishInterview);

// Get interview session
router.get("/:id", protect, getInterview);

module.exports = router;
