// ─── ModeSelector.tsx ─────────────────────────────────────────────────────────
"use client";
import type { InterviewMode } from "@/types";
import { useInterviewStore } from "@/store";
import Link from "next/link";

const MODES = [
  { id: "video" as InterviewMode, icon: "🎥", label: "Video Call", desc: "Camera + mic simulation with delivery scoring and body language feedback", tags: ["Camera", "Microphone", "Face-to-face"], color: "#60a5fa" },
  { id: "audio" as InterviewMode, icon: "🎙️", label: "Audio / Phone Screen", desc: "Voice-based interview with waveform visualizer and Whisper transcription", tags: ["Voice Only", "Phone Style", "Whisper AI"], color: "#a78bfa" },
  { id: "test" as InterviewMode, icon: "📝", label: "Written Test", desc: "Type detailed answers — scenario, technical, and case study questions", tags: ["Written", "Detailed", "Scenarios"], color: "#34d399" },
];

export default function ModeSelector({ onSelect }: { onSelect: (mode: InterviewMode) => void }) {
  const { jobRole, resumeAnalysis } = useInterviewStore();

  return (
    <div className="animate-fadeUp">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black mb-2 shimmer-text">Choose Interview Mode</h1>
        <p style={{ color: "#4a6a4a", fontSize: 14 }}>
          {jobRole ? `Preparing for: ${jobRole}` : "Questions will be tailored to your selected mode"}
        </p>
        {resumeAnalysis && (
          <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", color: "#34d399", fontFamily: "var(--font-mono)" }}>
            ✓ Resume analyzed • JD Match: {resumeAnalysis.jd_match_score}%
          </div>
        )}
      </div>

      {!jobRole && (
        <div className="mb-6 p-4 rounded-xl" style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)" }}>
          <p className="text-sm" style={{ color: "#c8a870" }}>
            💡 <strong>Tip:</strong> <Link href="/resume-analyzer" style={{ color: "#fbbf24", textDecoration: "underline" }}>Analyze your resume</Link> first for personalized questions tailored to the job description.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {MODES.map((m) => (
          <button key={m.id} onClick={() => onSelect(m.id)}
            className="w-full p-5 rounded-2xl text-left transition-all group"
            style={{ border: `1px solid ${m.color}20`, background: `${m.color}06`, cursor: "pointer" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.border = `1px solid ${m.color}45`; (e.currentTarget as HTMLElement).style.background = `${m.color}0d`; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.border = `1px solid ${m.color}20`; (e.currentTarget as HTMLElement).style.background = `${m.color}06`; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background: `${m.color}12`, border: `1px solid ${m.color}25` }}>{m.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-lg font-black" style={{ color: "#f0f2f0" }}>{m.label}</p>
                  <div className="flex gap-1.5">
                    {m.tags.map((t) => (
                      <span key={t} className="tag" style={{ background: `${m.color}12`, color: m.color }}>{t}</span>
                    ))}
                  </div>
                </div>
                <p className="text-sm" style={{ color: "#4a6a4a" }}>{m.desc}</p>
              </div>
              <span style={{ color: "#3a5a3a", fontSize: 18, fontWeight: 300 }}>→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
