"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { historyAPI } from "@/lib/api";
import { useAuthStore } from "@/store";
import Link from "next/link";

const gc = (s: number) => s >= 80 ? "#34d399" : s >= 60 ? "#fbbf24" : s >= 40 ? "#fb923c" : "#f87171";
const modeIcon: Record<string, string> = { video: "🎥", audio: "🎙️", test: "📝" };
const gradeColor: Record<string, string> = { "A+": "#34d399", "A": "#34d399", "B+": "#63d39e", "B": "#63d39e", "C+": "#fbbf24", "C": "#fbbf24", "D": "#fb923c", "F": "#f87171" };

export default function HistoryPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [sessions, setSessions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.replace("/login"); return; }
    loadData();
  }, [isAuthenticated, page, filter]);

  const loadData = async () => {
    setLoading(true);
    const [histRes, statsRes] = await Promise.all([
      historyAPI.getAll({ page, limit: 10, ...(filter ? { mode: filter } : {}) }),
      stats ? Promise.resolve({ data: stats }) : historyAPI.getStats(),
    ]);
    setSessions(histRes.data.sessions);
    setPagination(histRes.data.pagination);
    if (!stats) setStats(statsRes.data);
    setLoading(false);
  };

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
          <Link href="/dashboard" className="btn-ghost" style={{ fontSize: 13, padding: "8px 16px", textDecoration: "none" }}>← Dashboard</Link>
          <Link href="/interview" style={{ display: "inline-block" }}><button className="btn-primary" style={{ fontSize: 13, padding: "8px 16px" }}>New Interview</button></Link>
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 20px" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, fontFamily: "var(--font-syne)", marginBottom: 4 }} className="shimmer-text">Interview History</h1>
          <p style={{ color: "#4a6a4a", fontSize: 14 }}>Track your progress over time</p>
        </div>

        {/* Stats */}
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
            {[
              { label: "Sessions", value: stats.totalInterviews, icon: "🎯" },
              { label: "Avg Score", value: stats.avgScore ? `${stats.avgScore}%` : "–", icon: "📊" },
              { label: "Best", value: stats.bestScore ? `${stats.bestScore}%` : "–", icon: "🏆" },
              { label: "Progress", value: stats.improvement != null ? `${stats.improvement > 0 ? "+" : ""}${stats.improvement}%` : "–", icon: "📈", color: stats.improvement >= 0 ? "#34d399" : "#f87171" },
            ].map((s) => (
              <div key={s.label} className="glass" style={{ padding: "16px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: s.color || "#34d399", fontFamily: "var(--font-mono)" }}>{s.value}</div>
                <div style={{ fontSize: 10, color: "#3a5a3a", marginTop: 2, textTransform: "uppercase", letterSpacing: 0.8 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filter */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[{ value: "", label: "All" }, { value: "video", label: "🎥 Video" }, { value: "audio", label: "🎙️ Audio" }, { value: "test", label: "📝 Test" }].map((f) => (
            <button key={f.value} onClick={() => { setFilter(f.value); setPage(1); }}
              style={{ padding: "7px 16px", borderRadius: 100, border: `1px solid ${filter === f.value ? "rgba(52,211,153,0.5)" : "rgba(255,255,255,0.08)"}`, background: filter === f.value ? "rgba(52,211,153,0.1)" : "transparent", color: filter === f.value ? "#34d399" : "#6a8a6a", fontSize: 12, fontFamily: "var(--font-syne)", fontWeight: 600, cursor: "pointer" }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Sessions list */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ width: 32, height: 32, border: "2px solid rgba(52,211,153,0.15)", borderTopColor: "#34d399", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto" }} />
          </div>
        ) : sessions.length === 0 ? (
          <div className="glass" style={{ padding: 48, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
            <p style={{ fontWeight: 700, marginBottom: 6, color: "#c8e0c8" }}>No interviews yet</p>
            <p style={{ fontSize: 14, color: "#4a6a4a", marginBottom: 16 }}>Start practicing to see your history</p>
            <Link href="/interview"><button className="btn-primary">Start Interview</button></Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sessions.map((s) => (
              <Link key={s._id} href={`/results/${s._id}`} style={{ textDecoration: "none", display: "block" }}>
                <div className="glass" style={{ padding: "16px 20px", cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,211,153,0.25)"}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,211,153,0.12)"}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 20 }}>{modeIcon[s.mode]}</span>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 15, color: "#e8f2e8" }}>{s.jobRole}</p>
                        <p style={{ fontSize: 12, color: "#4a6a4a", marginTop: 2 }}>
                          {new Date(s.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          {" · "}{s.mode} · {s.answers?.length || 0} questions
                          {s.durationMinutes ? ` · ${s.durationMinutes}m` : ""}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 22, fontWeight: 900, fontFamily: "var(--font-mono)", color: gc(s.report?.overallScore || 0) }}>{s.report?.overallScore}</span>
                      <span className="tag" style={{ background: `${gradeColor[s.report?.grade] || "#34d399"}18`, color: gradeColor[s.report?.grade] || "#34d399" }}>{s.report?.grade}</span>
                      <span style={{ color: "#2a4a2a", fontSize: 14 }}>→</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost" style={{ padding: "8px 16px" }}>← Prev</button>
            <span style={{ padding: "8px 16px", fontSize: 13, color: "#4a6a4a", fontFamily: "var(--font-mono)" }}>{page} / {pagination.pages}</span>
            <button onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="btn-ghost" style={{ padding: "8px 16px" }}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
