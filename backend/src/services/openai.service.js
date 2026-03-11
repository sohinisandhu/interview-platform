const Groq = require("groq-sdk");
const fs = require("fs");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Helper: robust JSON parse ────────────────────────────────────────────────
// Llama models sometimes return extra text, trailing commas, single quotes etc.
const parseJSON = (raw) => {
  // Step 1: remove markdown fences
  let clean = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

  // Step 2: direct parse
  try { return JSON.parse(clean); } catch (_) {}

  // Step 3: extract first complete { } block
  const objStart = clean.indexOf("{");
  const objEnd = clean.lastIndexOf("}");
  if (objStart !== -1 && objEnd > objStart) {
    try { return JSON.parse(clean.slice(objStart, objEnd + 1)); } catch (_) {}
  }

  // Step 4: extract first complete [ ] block
  const arrStart = clean.indexOf("[");
  const arrEnd = clean.lastIndexOf("]");
  if (arrStart !== -1 && arrEnd > arrStart) {
    try { return JSON.parse(clean.slice(arrStart, arrEnd + 1)); } catch (_) {}
  }

  // Step 5: fix common LLM mistakes then retry
  const fixed = clean
    .replace(/,\s*([}\]])/g, "$1")                    // trailing commas
    .replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":')        // unquoted keys
    .replace(/:\s*'([^']*)'/g, ': "$1"')               // single → double quotes
    .replace(/:\s*(\d+)-(\d+)/g, ': $1');              // "1-10" → just number

  const fs2 = fixed.indexOf("{");
  const fe2 = fixed.lastIndexOf("}");
  if (fs2 !== -1 && fe2 > fs2) {
    try { return JSON.parse(fixed.slice(fs2, fe2 + 1)); } catch (_) {}
  }

  throw new Error("JSON parse failed: " + raw.slice(0, 300));
};

// ─── Groq call helper ─────────────────────────────────────────────────────────
const chat = async (systemPrompt, userPrompt, temperature = 0.3) => {
  const res = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",   // better JSON than 8b-instant
    temperature,
    max_tokens: 2048,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userPrompt   },
    ],
  });
  return res.choices[0].message.content;
};

// ─── 1. Analyze Resume vs JD ──────────────────────────────────────────────────
const analyzeResumeVsJD = async ({ resumeText, jobDescription, jobRole }) => {
  const raw = await chat(
    "You are an expert ATS and HR analyst. Return ONLY valid JSON, no explanation, no markdown. DO NOT wrap the response in markdown fences like ```json.",
    `Analyze this resume against the job description.

JOB ROLE: ${jobRole}
JOB DESCRIPTION: ${jobDescription.slice(0, 2000)}
RESUME: ${resumeText.slice(0, 2500)}

Return this exact JSON structure:
{
  "overall_score": 75,
  "jd_match_score": 68,
  "skill_scores": {
    "technical_skills": 70,
    "experience_relevance": 65,
    "education_fit": 80,
    "soft_skills": 75,
    "domain_knowledge": 60
  },
  "matched_skills": ["skill1", "skill2", "skill3"],
  "missing_skills": ["skill1", "skill2", "skill3"],
  "strengths": ["strength1", "strength2", "strength3"],
  "improvement_areas": ["area1", "area2"],
  "ats_tips": ["tip1", "tip2"],
  "interview_focus_areas": ["focus1", "focus2"],
  "overall_assessment": "Brief honest assessment here.",
  "hire_likelihood": "Medium"
}`
  );
  return parseJSON(raw);
};

// ─── 2. Generate Interview Questions ─────────────────────────────────────────
const generateQuestions = async ({
  resumeText,
  jobRole,
  jobDescription,
  resumeAnalysis,
  mode,
  numQuestions = 5,
}) => {
  const modeContext = {
    video: "VIDEO CALL interview - conversational questions, include body language tips in hints",
    audio: "PHONE SCREEN interview - clear concise questions for verbal answers",
    test:  "WRITTEN TEST - scenario-based, technical, and case study questions",
  }[mode] || "general interview";

  const raw = await chat(
    "You are a senior technical interviewer. Return ONLY a valid JSON array, no explanation, no markdown. DO NOT wrap the response in markdown fences like ```json.",
    `Generate exactly ${numQuestions} interview questions for this candidate.

JOB ROLE: ${jobRole}
MODE: ${modeContext}
SKILLS TO PROBE: ${resumeAnalysis?.missing_skills?.slice(0, 3).join(", ") || "general skills"}
RESUME EXCERPT: ${resumeText?.slice(0, 600) || "N/A"}
JD EXCERPT: ${jobDescription?.slice(0, 600) || "N/A"}

Return ONLY this JSON array (no wrapper object):
[
  {
    "id": "q1",
    "question": "Your question here?",
    "type": "technical",
    "difficulty": "medium",
    "category": "SQL",
    "hint": "Tip for answering in ${mode} format",
    "idealPoints": ["point 1", "point 2", "point 3"],
    "time_limit_minutes": 3
  },
  {
    "id": "q2",
    "question": "Another question?",
    "type": "behavioral",
    "difficulty": "easy",
    "category": "Communication",
    "hint": "Think of a specific example",
    "idealPoints": ["point 1", "point 2"],
    "time_limit_minutes": 3
  }
]

Generate all ${numQuestions} questions in this format.`,
    0.7
  );

  // Try to get array directly or from {questions:[]} wrapper
  let parsed = parseJSON(raw);

  // If it came back as { questions: [...] } unwrap it
  if (parsed && !Array.isArray(parsed) && Array.isArray(parsed.questions)) {
    parsed = parsed.questions;
  }

  // Validate and sanitize each question
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("generateQuestions: did not return an array");
  }

  return parsed.map((q, i) => ({
    id:                q.id || `q${i + 1}`,
    question:          String(q.question || ""),
    type:              String(q.type || "technical"),
    difficulty:        String(q.difficulty || "medium"),
    category:          String(q.category || ""),
    hint:              String(q.hint || ""),
    idealPoints:       Array.isArray(q.idealPoints)
                         ? q.idealPoints.map(String)
                         : Array.isArray(q.ideal_points)
                           ? q.ideal_points.map(String)
                           : [],
    time_limit_minutes: Number(q.time_limit_minutes) || 3,
  }));
};

// ─── 3. Evaluate Answer ───────────────────────────────────────────────────────
const evaluateAnswer = async ({ question, answer, jobRole, mode }) => {
  const modeExtra =
    mode === "video" ? "Also rate delivery_score (confidence/presence) and clarity_score (articulation)."
    : mode === "audio" ? "Also rate clarity_score (verbal clarity)."
    : "Evaluate depth, structure, and technical accuracy.";

  const raw = await chat(
    "You are a strict but fair interview evaluator. Return ONLY valid JSON, no explanation. DO NOT wrap the response in markdown fences like ```json.",
    `Evaluate this interview answer.

JOB ROLE: ${jobRole}
QUESTION: ${question.question}
TYPE: ${question.type} | DIFFICULTY: ${question.difficulty}
IDEAL POINTS: ${question.idealPoints?.join(", ") || "N/A"}
MODE: ${(mode || "test").toUpperCase()}
${modeExtra}

ANSWER: "${answer}"

Return exactly this JSON:
{
  "score": 7,
  "grade": "B",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "missed_points": ["missed point"],
  "ideal_answer": "Model answer in 2-3 sentences.",
  "delivery_score": null,
  "clarity_score": null,
  "overall_comment": "One honest encouraging sentence."
}`
  );

  const parsed = parseJSON(raw);

  // Normalize score to number
  if (typeof parsed.score === "string") {
    parsed.score = parseInt(parsed.score) || 5;
  }

  return parsed;
};

// ─── 4. Generate Final Report ─────────────────────────────────────────────────
const generateFinalReport = async ({
  jobRole,
  mode,
  questions,
  answers,
  feedbacks,
  resumeAnalysis,
}) => {
  const avgScore =
    feedbacks.reduce((sum, f) => sum + (Number(f.score) || 0), 0) /
    (feedbacks.length || 1);

  const qSummary = questions.map((q, i) => ({
    q: q.question?.slice(0, 80),
    score: feedbacks[i]?.score,
    grade: feedbacks[i]?.grade,
  }));

  const raw = await chat(
    "You are a professional interview coach. Return ONLY valid JSON, no explanation. DO NOT wrap the response in markdown fences like ```json.",
    `Generate interview performance report.

JOB ROLE: ${jobRole}
MODE: ${mode}
JD MATCH: ${resumeAnalysis?.jd_match_score || "N/A"}%
AVG SCORE: ${avgScore.toFixed(1)}/10
SCORES: ${feedbacks.map((f) => f.score).join(", ")}
Q SUMMARY: ${JSON.stringify(qSummary)}

Return exactly this JSON:
{
  "overall_score": 72,
  "grade": "B",
  "hire_recommendation": "Maybe",
  "executive_summary": "3-4 sentence honest assessment.",
  "top_strengths": ["strength 1", "strength 2", "strength 3"],
  "critical_gaps": ["gap 1", "gap 2"],
  "question_scores": [7, 6, 8, 5, 7],
  "skill_breakdown": {
    "technical": 70,
    "communication": 65,
    "problem_solving": 75,
    "experience": 60
  },
  "action_plan": [
    { "priority": "high", "action": "specific action", "timeline": "2 weeks" },
    { "priority": "medium", "action": "another action", "timeline": "1 month" }
  ],
  "resources": [
    { "topic": "topic name", "type": "course", "suggestion": "resource name" }
  ]
}`,
    0.4
  );

  return parseJSON(raw);
};

// ─── 5. Transcribe Audio ──────────────────────────────────────────────────────
// Groq supports Whisper too! Using it if file is provided.
const transcribeAudio = async (filePath) => {
  try {
    const stream = fs.createReadStream(filePath);
    const result = await groq.audio.transcriptions.create({
      file: stream,
      model: "whisper-large-v3-turbo",
      response_format: "verbose_json",
    });
    return {
      text: result.text || "",
      duration: result.duration || 0,
      language: result.language || "en",
    };
  } catch (err) {
    console.error("Whisper transcription failed:", err.message);
    return { text: "", duration: 0, language: "en" };
  }
};

module.exports = {
  analyzeResumeVsJD,
  generateQuestions,
  evaluateAnswer,
  generateFinalReport,
  transcribeAudio,
};
