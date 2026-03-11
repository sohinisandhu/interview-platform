import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Question, AnswerFeedback, InterviewMode, ResumeAnalysis } from "@/types";

// ─── Auth Store ────────────────────────────────────────────────────────────────
interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        set({ user, accessToken, isAuthenticated: true });
      },
      updateUser: (updates) =>
        set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
      logout: () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
    }),
    { name: "auth-store", partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }) }
  )
);

// ─── Interview Store ───────────────────────────────────────────────────────────
interface InterviewState {
  // Setup
  resumeId: string | null;
  resumeText: string;
  resumeName: string;
  jobRole: string;
  jobDescription: string;
  resumeAnalysis: ResumeAnalysis | null;

  // Session
  sessionId: string | null;
  mode: InterviewMode | null;
  questions: Question[];
  currentQuestionIndex: number;
  answers: string[];
  feedbacks: AnswerFeedback[];
  sessionStartTime: number | null;

  // Actions
  setResumeData: (id: string, name: string) => void;
  setJobData: (role: string, jd: string) => void;
  setResumeAnalysis: (a: ResumeAnalysis) => void;
  startSession: (sessionId: string, mode: InterviewMode, questions: Question[]) => void;
  addAnswer: (answer: string, feedback: AnswerFeedback) => void;
  nextQuestion: () => void;
  resetInterview: () => void;
  resetAll: () => void;
}

const initialInterviewState = {
  resumeId: null, resumeText: "", resumeName: "",
  jobRole: "", jobDescription: "", resumeAnalysis: null,
  sessionId: null, mode: null, questions: [],
  currentQuestionIndex: 0, answers: [], feedbacks: [], sessionStartTime: null,
};

export const useInterviewStore = create<InterviewState>()((set) => ({
  ...initialInterviewState,
  setResumeData: (id, name) => set({ resumeId: id, resumeName: name }),
  setJobData: (role, jd) => set({ jobRole: role, jobDescription: jd }),
  setResumeAnalysis: (a) => set({ resumeAnalysis: a }),
  startSession: (sessionId, mode, questions) =>
    set({ sessionId, mode, questions, currentQuestionIndex: 0, answers: [], feedbacks: [], sessionStartTime: Date.now() }),
  addAnswer: (answer, feedback) =>
    set((s) => ({ answers: [...s.answers, answer], feedbacks: [...s.feedbacks, feedback] })),
  nextQuestion: () => set((s) => ({ currentQuestionIndex: s.currentQuestionIndex + 1 })),
  resetInterview: () => set({ sessionId: null, mode: null, questions: [], currentQuestionIndex: 0, answers: [], feedbacks: [], sessionStartTime: null }),
  resetAll: () => set(initialInterviewState),
}));
