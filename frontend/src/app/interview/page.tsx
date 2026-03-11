"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { interviewAPI } from "@/lib/api";
import { useInterviewStore, useAuthStore } from "@/store";
import type { InterviewMode, AnswerFeedback } from "@/types";
import VideoModeUI from "@/components/interview/VideoModeUI";
import AudioModeUI from "@/components/interview/AudioModeUI";
import TestModeUI from "@/components/interview/TestModeUI";
import FeedbackPanel from "@/components/interview/FeedbackPanel";
import ModeSelector from "@/components/interview/ModeSelector";
import QuestionsPreview from "@/components/interview/QuestionsPreview";
import LoadingScreen from "@/components/shared/LoadingScreen";
import Link from "next/link";

type Phase = "mode-select" | "preview" | "interview" | "feedback";

function InterviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const store = useInterviewStore();

  const [phase, setPhase] = useState<Phase>("mode-select");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [currentFeedback, setCurrentFeedback] = useState<AnswerFeedback | null>(null);
  const [answerStartTime, setAnswerStartTime] = useState(Date.now());

  useEffect(() => {
    if (!isAuthenticated) { router.replace("/login"); return; }
    const modeParam = searchParams.get("mode") as InterviewMode;
    if (modeParam && ["video", "audio", "test"].includes(modeParam)) {
      handleModeSelect(modeParam);
    }
  }, [isAuthenticated]);

  const handleModeSelect = async (mode: InterviewMode) => {
    if (!store.jobRole) {
      toast("Tip: Analyze your resume first for personalized questions!", { icon: "💡" });
    }
    setLoading(true);
    setLoadingMsg(`🤖 Generating ${mode} interview questions...`);
    try {
      const { data } = await interviewAPI.start({
        resumeId: store.resumeId || undefined,
        jobRole: store.jobRole || "Software Engineer",
        jobDescription: store.jobDescription,
        mode,
        resumeAnalysis: store.resumeAnalysis,
      });
      store.startSession(data.sessionId, mode, data.questions);
      setPhase("preview");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to start interview.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (answerText: string): Promise<AnswerFeedback> => {
    const timeTaken = Math.round((Date.now() - answerStartTime) / 1000);
    setLoading(true);
    setLoadingMsg("⚡ Evaluating your answer...");
    try {
      const { data } = await interviewAPI.submitAnswer(store.sessionId!, {
        questionIndex: store.currentQuestionIndex,
        answerText,
        timeTakenSeconds: timeTaken,
      });
      const fb = {
        score: data.feedback.score,
        grade: data.feedback.grade,
        strengths: data.feedback.strengths,
        improvements: data.feedback.improvements,
        missedPoints: data.feedback.missed_points,
        idealAnswer: data.feedback.ideal_answer,
        deliveryScore: data.feedback.delivery_score,
        clarityScore: data.feedback.clarity_score,
        overallComment: data.feedback.overall_comment,
      };
      store.addAnswer(answerText, fb);
      setCurrentFeedback(fb);
      setPhase("feedback");
      return fb;
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Evaluation failed.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    const isLast = store.currentQuestionIndex + 1 >= store.questions.length;
    if (isLast) {
      setLoading(true);
      setLoadingMsg("📊 Generating your final report...");
      try {
        const { data } = await interviewAPI.complete(store.sessionId!);
        router.push(`/results/${store.sessionId}`);
      } catch (err: any) {
        toast.error("Failed to generate report.");
        setLoading(false);
      }
    } else {
      store.nextQuestion();
      setCurrentFeedback(null);
      setPhase("interview");
      setAnswerStartTime(Date.now());
    }
  };

  if (loading) return <LoadingScreen message={loadingMsg} />;

  return (
    <div className="min-h-screen" style={{ background: "#08090c" }}>
      <nav className="sticky top-0 z-50 border-b px-6 py-4 flex items-center justify-between"
        style={{ background: "rgba(8,9,12,0.95)", borderColor: "rgba(52,211,153,0.1)", backdropFilter: "blur(20px)" }}>
        <Link href="/dashboard" className="flex items-center gap-2 text-decoration-none">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#paint0_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <defs>
              <linearGradient id="paint0_linear" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#34d399" />
                <stop offset="1" stopColor="#60a5fa" />
              </linearGradient>
            </defs>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <line x1="8" y1="13" x2="16" y2="13" />
            <line x1="8" y1="17" x2="16" y2="17" />
            <line x1="8" y1="9" x2="10" y2="9" />
            <path d="M16 10.5c0-2.5 1.5-3.5 3.5-3.5-2 0-3.5-1-3.5-3.5 0 2.5-1.5 3.5-3.5 3.5 2 0 3.5 1 3.5 3.5z" fill="url(#paint0_linear)" stroke="none" />
          </svg>
          <span className="shimmer-text text-lg font-black tracking-tight" style={{ fontFamily: "var(--font-syne)" }}>Smart Hire</span>
        </Link>
        {phase !== "mode-select" && (
          <div className="flex items-center gap-4">
            {/* Progress dots */}
            <div className="flex gap-1.5">
              {store.questions.map((_, i) => {
                const done = i < store.feedbacks.length;
                const active = i === store.currentQuestionIndex;
                return (
                  <div key={i} className="w-2 h-2 rounded-full transition-all"
                    style={{ background: done ? "#34d399" : active ? "#60a5fa" : "rgba(255,255,255,0.1)" }} />
                );
              })}
            </div>
            <span className="text-xs" style={{ color: "#4a6a4a", fontFamily: "var(--font-mono)" }}>
              Q{store.currentQuestionIndex + 1}/{store.questions.length}
            </span>
          </div>
        )}
      </nav>

      <div className="max-w-3xl mx-auto px-5 py-8">
        {phase === "mode-select" && <ModeSelector onSelect={handleModeSelect} />}

        {phase === "preview" && (
          <QuestionsPreview
            questions={store.questions}
            mode={store.mode!}
            jobRole={store.jobRole || "Interview"}
            onStart={() => { setPhase("interview"); setAnswerStartTime(Date.now()); }}
            onBack={() => setPhase("mode-select")}
          />
        )}

        {phase === "interview" && store.questions[store.currentQuestionIndex] && (
          <div className="glass p-6 animate-fadeUp">
            {store.mode === "video" && (
              <VideoModeUI
                question={store.questions[store.currentQuestionIndex]}
                questionNum={store.currentQuestionIndex + 1}
                totalQuestions={store.questions.length}
                prevScores={store.feedbacks.map((f) => f.score)}
                onSubmit={handleSubmitAnswer}
              />
            )}
            {store.mode === "audio" && (
              <AudioModeUI
                question={store.questions[store.currentQuestionIndex]}
                questionNum={store.currentQuestionIndex + 1}
                totalQuestions={store.questions.length}
                prevScores={store.feedbacks.map((f) => f.score)}
                onSubmit={handleSubmitAnswer}
              />
            )}
            {store.mode === "test" && (
              <TestModeUI
                question={store.questions[store.currentQuestionIndex]}
                questionNum={store.currentQuestionIndex + 1}
                totalQuestions={store.questions.length}
                prevScores={store.feedbacks.map((f) => f.score)}
                onSubmit={handleSubmitAnswer}
              />
            )}
          </div>
        )}

        {phase === "feedback" && currentFeedback && (
          <div className="glass p-6 animate-fadeUp">
            <FeedbackPanel
              feedback={currentFeedback}
              mode={store.mode!}
              onNext={handleNext}
              isLast={store.currentQuestionIndex + 1 >= store.questions.length}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading..." />}>
      <InterviewContent />
    </Suspense>
  );
}
