const express = require("express");
const { getHistory, getStats, getSessionDetail } = require("../controllers/history.controller");
const { protect } = require("../middleware/auth.middleware");
const router = express.Router();
router.get("/", protect, getHistory);
router.get("/stats", protect, getStats);
router.get("/:sessionId", protect, getSessionDetail);
module.exports = router;
