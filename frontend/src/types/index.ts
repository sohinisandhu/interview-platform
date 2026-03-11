// ─── Auth ──────────────────────────────────────────────────────────────────────
export interface User {
  _id: string;
  name: string;
  email: string;
  stats: { totalInterviews: number; avgScore: number; bestScore: number; totalHours: number };
  preferences: { defaultMode: InterviewMode; questionsPerSession: number };
  createdAt: string;
}

// ─── Resume ────────────────────────────────────────────────────────────────────
export interface ResumeAnalysis {
  overall_score: number;
  jd_match_score: number;
  skill_scores: Record<string, number>;
  matched_skills: string[];
  missing_skills: string[];
  strengths: string[];
  improvement_areas: string[];
  ats_tips: string[];
  interview_focus_areas: string[];
  experience_gaps: string[];
  overall_assessment: string;
  hire_likelihood: "High" | "Medium" | "Low";
}

export interface Resume {
  _id: string;
  originalName: string;
  wordCount: number;
  analyses: Array<ResumeAnalysis & { jobRole: string; analyzedAt: string }>;
  createdAt: string;
}

// ─── Interview ─────────────────────────────────────────────────────────────────
export type InterviewMode = "video" | "audio" | "test";

export interface Question {
  id: string;
  question: string;
  type: "technical" | "behavioral" | "situational" | "culture-fit" | "coding";
  difficulty: "easy" | "medium" | "hard";
  category: string;
  hint: string;
  idealPoints: string[];
  time_limit_minutes?: number;
}

export interface AnswerFeedback {
  score: number;
  grade: string;
  strengths: string[];
  improvements: string[];
  missedPoints: string[];
  idealAnswer: string;
  deliveryScore?: number;
  clarityScore?: number;
  overallComment: string;
}

export interface InterviewReport {
  overallScore: number;
  grade: string;
  hireRecommendation: string;
  executiveSummary: string;
  topStrengths: string[];
  criticalGaps: string[];
  questionScores: number[];
  skillBreakdown: { technical: number; communication: number; problemSolving: number; experience: number };
  actionPlan: Array<{ priority: string; action: string; timeline: string }>;
  resources: Array<{ topic: string; type: string; suggestion: string }>;
}

export interface InterviewSession {
  _id: string;
  jobRole: string;
  mode: InterviewMode;
  status: "in_progress" | "completed" | "abandoned";
  questions: Question[];
  answers: Array<{ answerText: string; feedback: AnswerFeedback }>;
  report?: InterviewReport;
  durationMinutes?: number;
  completedAt?: string;
  createdAt: string;
}

// ─── API Responses ─────────────────────────────────────────────────────────────
export interface ApiError { error: string; code?: string }
export interface PaginatedResponse<T> { data: T[]; pagination: { page: number; total: number; pages: number } }
