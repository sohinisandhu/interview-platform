const { InterviewSession, Resume } = require("../models");

const {
  generateQuestions,
  evaluateAnswer,
  generateFinalReport
} = require("../services/openai.service");


// START INTERVIEW
exports.startInterview = async (req, res) => {
  try {

    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const { resumeId, jobRole, jobDescription, mode } = req.body;

    let resumeText = "";
    if (resumeId) {
      const resume = await Resume.findById(resumeId);
      if (resume) {
        resumeText = resume.parsedText;
      }
    }

    let questions = await generateQuestions({
      resumeText,
      jobRole,
      jobDescription,
      mode,
      numQuestions: 5
    });

    if (typeof questions === "string") {
      questions = JSON.parse(questions);
    }

    const formattedQuestions = questions.map(q => ({
      id: q.id,
      question: q.question,
      type: q.type,
      difficulty: q.difficulty,
      category: q.category || "",
      hint: q.hint || "",
      idealPoints: q.ideal_points || q.idealPoints || []
    }));

    const session = new InterviewSession({
      userId,
      resumeId,
      jobRole,
      jobDescription,
      mode
    });

    session.questions = formattedQuestions;
    session.markModified("questions");

    await session.save();

    res.json({
      success: true,
      sessionId: session._id,
      questions: formattedQuestions
    });

  } catch (error) {
    console.error("Start Interview Error:", error);
    require('fs').appendFileSync('error.log', "Start Interview Error:\n" + (error.stack || error) + '\n');
    res.status(500).json({
      success: false,
      message: "Failed to start interview"
    });
  }
};



// SUBMIT ANSWER
exports.submitAnswer = async (req, res) => {
  try {

    const { sessionId } = req.params;
    const { questionIndex, answerText, timeTakenSeconds } = req.body;

    const session = await InterviewSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found"
      });
    }

    // Use questionIndex to find the question from the array
    const question = session.questions[questionIndex];

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found"
      });
    }

    const feedback = await evaluateAnswer({
      question,
      answer: answerText,
      jobRole: session.jobRole,
      mode: session.mode
    });

    session.answers.push({
      questionId: question.id,
      question: question.question,
      questionType: question.type,
      difficulty: question.difficulty,
      category: question.category,
      answerText,
      timeTakenSeconds: timeTakenSeconds || 0,
      feedback
    });

    await session.save();

    res.json({
      success: true,
      feedback
    });

  } catch (error) {

    console.error("Submit Answer Error:", error);
    require('fs').appendFileSync('error.log', "Submit Answer Error:\n" + (error.stack || error) + '\n');

    res.status(500).json({
      success: false,
      message: "Failed to evaluate answer"
    });

  }
};



// FINISH INTERVIEW
exports.finishInterview = async (req, res) => {

  try {

    const { sessionId } = req.params;

    const session = await InterviewSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found"
      });
    }

    const report = await generateFinalReport({
      jobRole: session.jobRole,
      mode: session.mode,
      questions: session.questions,
      answers: session.answers.map(a => a.answerText),
      feedbacks: session.answers.map(a => a.feedback)
    });

    session.report = report;
    session.status = "completed";
    session.completedAt = new Date();

    await session.save();

    res.json({
      success: true,
      report
    });

  } catch (error) {

    console.error("Finish Interview Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate report"
    });

  }

};



// GET INTERVIEW
exports.getInterview = async (req, res) => {

  try {

    const { id } = req.params;

    const session = await InterviewSession.findById(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Interview not found"
      });
    }

    res.json(session);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

};