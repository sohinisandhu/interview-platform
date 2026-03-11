"use client";
import type { AnswerFeedback, InterviewMode } from "@/types";

const modeColor: Record<InterviewMode, string> = { video: "#60a5fa", audio: "#a78bfa", test: "#34d399" };
const scoreColor = (s: number) => s >= 8 ? "#34d399" : s >= 6 ? "#fbbf24" : s >= 4 ? "#fb923c" : "#f87171";

export default function FeedbackPanel({ feedback, mode, onNext, isLast }: {
  feedback: AnswerFeedback; mode: InterviewMode; onNext: () => void; isLast: boolean;
}) {
  const mc = modeColor[mode];
  const sc = scoreColor(feedback.score);

  return (
    <div className="animate-fadeUp">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#f0f2f0" }}>Answer Feedback</h3>
        <div style={{ textAlign: "center", padding: "8px 14px", borderRadius: 12, background: `${sc}12`, border: `1.5px solid ${sc}` }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: sc, fontFamily: "var(--font-mono)", lineHeight: 1 }}>{feedback.score}</div>
          <div style={{ fontSize: 9, color: sc, letterSpacing: 1, marginTop: 2 }}>/10 • {feedback.grade}</div>
        </div>
      </div>

      {/* Mode-specific scores */}
      {(feedback.deliveryScore || feedback.clarityScore) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
          {[["Content", feedback.score], feedback.deliveryScore ? ["Delivery", feedback.deliveryScore] : null, feedback.clarityScore ? ["Clarity", feedback.clarityScore] : null].filter(Boolean).map(([l, v]: any) => (
            <div key={l} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: scoreColor(v), fontFamily: "var(--font-mono)" }}>{v}</div>
              <div style={{ fontSize: 9, color: "#3a5a3a", marginTop: 2, textTransform: "uppercase", letterSpacing: 0.8 }}>{l}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
        <div style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)", borderRadius: 12, padding: "14px 16px" }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#34d399", letterSpacing: 1.5, marginBottom: 8, fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>✅ Strengths</p>
          {feedback.strengths?.map((s, i) => <p key={i} style={{ fontSize: 13, color: "#7aaa7a", marginBottom: 5, lineHeight: 1.5 }}>• {s}</p>)}
        </div>
        <div style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)", borderRadius: 12, padding: "14px 16px" }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#fbbf24", letterSpacing: 1.5, marginBottom: 8, fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>💡 Improvements</p>
          {feedback.improvements?.map((s, i) => <p key={i} style={{ fontSize: 13, color: "#c8a870", marginBottom: 5, lineHeight: 1.5 }}>• {s}</p>)}
        </div>
        <div style={{ background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.15)", borderRadius: 12, padding: "14px 16px" }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#60a5fa", letterSpacing: 1.5, marginBottom: 8, fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>🎯 Ideal Answer</p>
          <p style={{ fontSize: 13, color: "#90b8e0", lineHeight: 1.6 }}>{feedback.idealAnswer}</p>
        </div>
      </div>

      {feedback.overallComment && (
        <p style={{ textAlign: "center", color: mc, fontSize: 13, fontStyle: "italic", marginBottom: 16 }}>{feedback.overallComment}</p>
      )}

      <button onClick={onNext} className="btn-primary w-full"
        style={{ background: `linear-gradient(135deg, ${mode === "video" ? "#0d1e4a" : mode === "audio" ? "#2a0d4a" : "#0d3a20"}, #080a0c)`, color: mc }}>
        {isLast ? "View Final Report 🏆" : "Next Question →"}
      </button>
    </div>
  );
}
