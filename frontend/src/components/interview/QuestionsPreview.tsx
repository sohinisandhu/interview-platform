"use client";
import type { Question, InterviewMode } from "@/types";

const diffColor: Record<string, string> = { easy: "#34d399", medium: "#fbbf24", hard: "#f87171" };
const typeColor: Record<string, string> = { technical: "#34d399", behavioral: "#60a5fa", situational: "#a78bfa", "culture-fit": "#fb923c", coding: "#fbbf24" };
const modeLabel: Record<InterviewMode, string> = { video: "🎥 Video Call", audio: "🎙️ Audio", test: "📝 Written Test" };

export default function QuestionsPreview({ questions, mode, jobRole, onStart, onBack }: {
  questions: Question[]; mode: InterviewMode; jobRole: string;
  onStart: () => void; onBack: () => void;
}) {
  return (
    <div className="animate-fadeUp">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3"
          style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)" }}>
          <span className="text-xs font-bold" style={{ color: "#34d399", fontFamily: "var(--font-mono)" }}>
            {modeLabel[mode]}
          </span>
        </div>
        <h2 className="text-2xl font-black mb-1" style={{ color: "#f0f2f0" }}>Your Interview Questions</h2>
        <p style={{ color: "#4a6a4a", fontSize: 14 }}>{questions.length} questions prepared for <span style={{ color: "#34d399" }}>{jobRole}</span></p>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        {questions.map((q, i) => (
          <div key={q.id} className="glass-sm p-4 animate-fadeUp" style={{ animationDelay: `${i * 0.07}s` }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex gap-2 flex-wrap">
                <span className="tag" style={{ background: `${typeColor[q.type] || "#34d399"}18`, color: typeColor[q.type] || "#34d399" }}>{q.type}</span>
                <span className="tag" style={{ background: `${diffColor[q.difficulty]}18`, color: diffColor[q.difficulty] }}>{q.difficulty}</span>
                {q.category && <span className="tag" style={{ background: "rgba(255,255,255,0.06)", color: "#6a8a6a" }}>{q.category}</span>}
              </div>
              <span style={{ color: "#2a4a2a", fontSize: 11, fontFamily: "var(--font-mono)" }}>Q{i + 1}</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "#c8e0c8" }}>{q.question}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-ghost flex-1 py-3 text-sm">← Back</button>
        <button onClick={onStart} className="btn-primary flex-grow-[3] py-3 text-base">
          Start Interview →
        </button>
      </div>
    </div>
  );
}
