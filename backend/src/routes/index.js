const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const resumeRoutes = require("./resume.routes");
const interviewRoutes = require("./interview.routes");
const historyRoutes = require("./history.routes");
const speechRoutes = require("./speech.routes");

router.use("/auth", authRoutes);
router.use("/resume", resumeRoutes);
router.use("/interview", interviewRoutes);
router.use("/history", historyRoutes);
router.use("/speech", speechRoutes);

module.exports = router;