"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, router]);

  const features = [
    { icon: "📄", title: "Resume Analyser", desc: "AI scores your resume against JD with match percentage and skill gap analysis" },
    { icon: "🎯", title: "JD Match Score", desc: "Know exactly which skills you match and what's missing before the interview" },
    { icon: "🎥", title: "Video Interview", desc: "Camera + mic simulation with delivery scoring and body language tips" },
    { icon: "🎙️", title: "Audio Interview", desc: "Phone screen practice with real waveform and Whisper transcription" },
    { icon: "📝", title: "Written Test", desc: "Scenario and technical questions with detailed written feedback" },
    { icon: "🏆", title: "Performance Report", desc: "Hire recommendation, action plan, and resources to improve" },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "#08090c" }}>
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div style={{ position: "absolute", width: 700, height: 700, background: "#0a3a1a", borderRadius: "50%", filter: "blur(140px)", opacity: 0.1, top: -200, left: -200 }} />
        <div style={{ position: "absolute", width: 500, height: 500, background: "#0a1a4a", borderRadius: "50%", filter: "blur(120px)", opacity: 0.08, bottom: 0, right: -100 }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-5 py-20">
        {/* Hero */}
        <div className="text-center mb-20 animate-fadeUp">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 record-pulse inline-block" />
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#34d399", fontFamily: "var(--font-mono)" }}>
              AI-Powered Interview Prep
            </span>
          </div>

          <h1 className="shimmer-text text-6xl font-black leading-tight mb-6">
            Land Your<br />Dream Job
          </h1>
          <p className="text-lg mb-10 max-w-xl mx-auto leading-relaxed" style={{ color: "#4a6a4a" }}>
            Upload your resume, paste the job description, choose how you want to practice — video, audio, or written — and get instant AI feedback.
          </p>

          <div className="flex gap-4 justify-center">
            <button onClick={() => router.push("/register")} className="btn-primary text-base px-8 py-4">
              Get Started Free →
            </button>
            <button onClick={() => router.push("/login")} className="btn-ghost text-base px-8 py-4">
              Sign In
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div key={i} className="glass p-6 animate-fadeUp" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-base font-bold mb-2" style={{ color: "#e8f2e8" }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#4a6a4a" }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-12 mt-16 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {[["3", "Interview Modes"], ["5+", "Questions/Session"], ["AI", "Powered Analysis"]].map(([v, l]) => (
            <div key={l} className="text-center">
              <div className="text-3xl font-black mb-1 shimmer-text">{v}</div>
              <div className="text-xs" style={{ color: "#3a5a3a", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: 1 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
