"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { interviewAPI } from "@/lib/api";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";
import Link from "next/link";

const gc = (s: number) => s >= 80 ? "#34d399" : s >= 60 ? "#fbbf24" : s >= 40 ? "#fb923c" : "#f87171";
const gradeColor: Record<string, string> = { "A+": "#34d399", "A": "#34d399", "B+": "#63d39e", "B": "#63d39e", "C+": "#fbbf24", "C": "#fbbf24", "D": "#fb923c", "F": "#f87171" };
const hireColor: Record<string, string> = { "Strong Hire": "#34d399", "Hire": "#63d39e", "Maybe": "#fbbf24", "No Hire": "#f87171" };
const modeLabel: Record<string, string> = { video: "🎥 Video Call", audio: "🎙️ Audio", test: "📝 Written Test" };

const ProgressBar = ({ value, color = "#34d399" }: { value: number; color?: string }) => (
  <div style={{ height: 7, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
    <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: 4, transition: "width 1.2s ease", boxShadow: `0 0 8px ${color}55` }} />
  </div>
);

export default function ResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    interviewAPI.getSession(sessionId).then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    }).catch(() => { router.push("/dashboard"); });
  }, [sessionId]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#08090c", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "2.5px solid rgba(52,211,153,0.15)", borderTopColor: "#34d399", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.7s linear infinite" }} />
          <p style={{ color: "#34d399" }}>Loading results...</p>
        </div>
      </div>
    );
  }

  const report = session?.report;
  const skillData = report?.skillBreakdown ? [
    { subject: "Technical", value: report.skillBreakdown.technical || 0 },
    { subject: "Communication", value: report.skillBreakdown.communication || 0 },
    { subject: "Problem Solving", value: report.skillBreakdown.problemSolving || 0 },
    { subject: "Experience", value: report.skillBreakdown.experience || 0 },
  ] : [];

  return (
    <div style={{ minHeight: "100vh", background: "#08090c" }}>
      <nav style={{ position: "sticky", top: 0, zIndex: 50, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(8,9,12,0.95)", borderBottom: "1px solid rgba(52,211,153,0.1)", backdropFilter: "blur(20px)" }}>
        <Link href="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
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
          <span className="shimmer-text" style={{ fontSize: 18, fontWeight: 900, fontFamily: "var(--font-syne)" }}>Smart Hire</span>
        </Link>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/dashboard" className="btn-ghost" style={{ fontSize: 13, padding: "8px 16px", textDecoration: "none" }}>Dashboard</Link>
          <Link href="/interview" className="btn-ghost" style={{ fontSize: 13, padding: "8px 16px", textDecoration: "none", background: "linear-gradient(135deg,#0d3a20,#081c10)", color: "#34d399", border: "none" }}>New Interview</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 20px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }} className="animate-fadeUp">
          <p style={{ fontSize: 11, color: "#4a6a4a", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10, fontFamily: "var(--font-mono)" }}>
            {modeLabel[session?.mode]} • {session?.jobRole}
          </p>
          <h1 className="shimmer-text" style={{ fontSize: 32, fontWeight: 900, marginBottom: 14, fontFamily: "var(--font-syne)" }}>Interview Complete 🏆</h1>

          {/* Score + Grade */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 20, padding: "20px 32px", borderRadius: 20, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            {/* Ring */}
            <div style={{ position: "relative", width: 90, height: 90 }}>
              <svg width="90" height="90" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
                <circle cx="45" cy="45" r="38" fill="none" stroke={gc(report?.overallScore || 0)} strokeWidth="7"
                  strokeDasharray={`${2 * Math.PI * 38 * (report?.overallScore || 0) / 100} ${2 * Math.PI * 38}`}
                  strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${gc(report?.overallScore || 0)}66)` }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 22, fontWeight: 900, color: gc(report?.overallScore || 0), fontFamily: "var(--font-mono)" }}>{report?.overallScore}</span>
                <span style={{ fontSize: 9, color: gc(report?.overallScore || 0), opacity: 0.7 }}>/ 100</span>
              </div>
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 40, fontWeight: 900, color: gradeColor[report?.grade] || "#34d399", fontFamily: "var(--font-mono)" }}>{report?.grade}</div>
              <div style={{ marginTop: 6 }}>
                <span style={{ padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 700, background: `${hireColor[report?.hireRecommendation] || "#34d399"}18`, color: hireColor[report?.hireRecommendation] || "#34d399", border: `1px solid ${hireColor[report?.hireRecommendation] || "#34d399"}33` }}>
                  {report?.hireRecommendation}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Executive Summary */}
          <div className="glass p-6 animate-fadeUp" style={{ background: "rgba(12,18,14,0.9)", border: "1px solid rgba(96,165,250,0.12)" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#60a5fa", letterSpacing: 1.5, marginBottom: 10, fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>🤖 AI Assessment</p>
            <p style={{ fontSize: 14, color: "#90b0d0", lineHeight: 1.8 }}>{report?.executiveSummary}</p>
          </div>

          {/* Question scores + Radar */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {/* Q Scores */}
            <div className="glass p-5 animate-fadeUp">
              <p style={{ fontSize: 10, fontWeight: 700, color: "#5a8a5a", letterSpacing: 1.5, marginBottom: 14, fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>Question Scores</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(report?.questionScores || session?.answers?.map((a: any) => a.feedback?.score) || []).map((s: number, i: number) => (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#3a5a3a" }}>Q{i + 1}</span>
                      <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", fontWeight: 700, color: gc(s * 10) }}>{s}/10</span>
                    </div>
                    <ProgressBar value={s * 10} color={gc(s * 10)} />
                  </div>
                ))}
              </div>
            </div>

            {/* Radar Chart */}
            {skillData.length > 0 && (
              <div className="glass p-5 animate-fadeUp">
                <p style={{ fontSize: 10, fontWeight: 700, color: "#5a8a5a", letterSpacing: 1.5, marginBottom: 10, fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>Skill Radar</p>
                <ResponsiveContainer width="100%" height={160}>
                  <RadarChart data={skillData}>
                    <PolarGrid stroke="rgba(52,211,153,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#4a6a4a", fontSize: 10 }} />
                    <Radar dataKey="value" stroke="#34d399" fill="#34d399" fillOpacity={0.12} strokeWidth={2} />
                    <Tooltip contentStyle={{ background: "#0d1810", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 8, color: "#e8f2e8", fontFamily: "var(--font-syne)", fontSize: 12 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Strengths + Gaps */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="glass-sm p-5 animate-fadeUp">
              <p style={{ fontSize: 10, fontWeight: 700, color: "#34d399", letterSpacing: 1.5, marginBottom: 12, fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>✅ Top Strengths</p>
              {report?.topStrengths?.map((s: string, i: number) => <p key={i} style={{ fontSize: 13, color: "#7aaa7a", marginBottom: 7 }}>• {s}</p>)}
            </div>
            <div className="glass-sm p-5 animate-fadeUp">
              <p style={{ fontSize: 10, fontWeight: 700, color: "#f87171", letterSpacing: 1.5, marginBottom: 12, fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>⚠️ Critical Gaps</p>
              {report?.criticalGaps?.map((s: string, i: number) => <p key={i} style={{ fontSize: 13, color: "#9a7070", marginBottom: 7 }}>• {s}</p>)}
            </div>
          </div>

          {/* Action Plan */}
          {report?.actionPlan?.length > 0 && (
            <div className="glass p-6 animate-fadeUp">
              <p style={{ fontSize: 10, fontWeight: 700, color: "#fbbf24", letterSpacing: 1.5, marginBottom: 14, fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>📋 Action Plan</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {report.actionPlan.map((a: any, i: number) => (
                  <div key={i} style={{ display: "flex", gap: 10, padding: "12px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
                    <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, height: "fit-content", fontFamily: "var(--font-mono)", background: a.priority === "high" ? "rgba(248,113,113,0.15)" : a.priority === "medium" ? "rgba(251,191,36,0.15)" : "rgba(52,211,153,0.12)", color: a.priority === "high" ? "#f87171" : a.priority === "medium" ? "#fbbf24" : "#34d399" }}>
                      {a.priority}
                    </span>
                    <div>
                      <p style={{ fontSize: 13, color: "#c8c8a8", marginBottom: 2 }}>{a.action}</p>
                      <p style={{ fontSize: 11, color: "#4a4a3a" }}>⏱ {a.timeline}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resources */}
          {report?.resources?.length > 0 && (
            <div className="glass p-6 animate-fadeUp">
              <p style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", letterSpacing: 1.5, marginBottom: 14, fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>📚 Recommended Resources</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {report.resources.map((r: any, i: number) => (
                  <div key={i} style={{ padding: "12px 14px", background: "rgba(167,139,250,0.05)", border: "1px solid rgba(167,139,250,0.12)", borderRadius: 12 }}>
                    <span className="tag" style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa", marginBottom: 6, display: "inline-flex" }}>{r.type}</span>
                    <p style={{ fontSize: 12, color: "#b0a0d8", lineHeight: 1.5 }}><strong style={{ color: "#d0c0f0" }}>{r.topic}</strong>: {r.suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Link href="/history" style={{ display: "block" }}>
              <button className="btn-ghost w-full py-3 text-sm">View History</button>
            </Link>
            <Link href="/interview" style={{ display: "block" }}>
              <button className="btn-primary w-full py-3 text-sm">New Interview →</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
