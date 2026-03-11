"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import { historyAPI } from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Link from "next/link";

const gradeColor: Record<string, string> = {
  "A+": "#34d399", "A": "#34d399", "B+": "#63d39e", "B": "#63d39e",
  "C+": "#fbbf24", "C": "#fbbf24", "D": "#fb923c", "F": "#f87171",
};

const modeIcon: Record<string, string> = { video: "🎥", audio: "🎙️", test: "📝" };

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.replace("/login"); return; }
    Promise.all([historyAPI.getStats(), historyAPI.getAll({ limit: 5 })]).then(([statsRes, sessRes]) => {
      setStats(statsRes.data);
      setSessions(sessRes.data.sessions);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [isAuthenticated, router]);

  const statCards = [
    { label: "Interviews", value: stats?.totalInterviews || 0, icon: "🎯" },
    { label: "Avg Score", value: stats?.avgScore ? `${stats.avgScore}%` : "–", icon: "📊" },
    { label: "Best Score", value: stats?.bestScore ? `${stats.bestScore}%` : "–", icon: "🏆" },
    { label: "Improvement", value: stats?.improvement != null ? `${stats.improvement > 0 ? "+" : ""}${stats.improvement}%` : "–", icon: "📈", color: stats?.improvement >= 0 ? "#34d399" : "#f87171" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#08090c" }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b px-6 py-4 flex items-center justify-between"
        style={{ background: "rgba(8,9,12,0.95)", borderColor: "rgba(52,211,153,0.1)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-3">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#paint0_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          <span className="text-lg font-black shimmer-text font-syne tracking-tight">Smart Hire</span>
          <span className="tag" style={{ background: "rgba(52,211,153,0.1)", color: "#34d399" }}>Platform</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="btn-ghost text-sm py-2">Dashboard</Link>
          <Link href="/resume-analyzer" className="btn-ghost text-sm py-2">Analyser</Link>
          <Link href="/history" className="btn-ghost text-sm py-2">History</Link>
          <button onClick={() => { logout(); router.push("/"); }} className="btn-ghost text-sm py-2">Logout</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-5 py-8">
        {/* Welcome */}
        <div className="mb-8 animate-fadeUp">
          <h1 className="text-3xl font-black" style={{ color: "#f0f2f0" }}>
            Hey {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: "#4a6a4a" }}>Ready for today's interview practice?</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((s, i) => (
            <div key={i} className="glass p-5 animate-fadeUp" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-2xl font-black mb-1" style={{ color: s.color || "#34d399", fontFamily: "var(--font-mono)" }}>{s.value}</div>
              <div className="text-xs uppercase tracking-wider" style={{ color: "#4a6a4a" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Progress Chart */}
        {stats?.recentTrend?.length > 1 && (
          <div className="glass p-6 mb-8 animate-fadeUp">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: "#5a8a5a", fontFamily: "var(--font-mono)" }}>Score Trend</h3>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={stats.recentTrend}>
                <XAxis dataKey="date" tick={{ fill: "#3a5a3a", fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "#3a5a3a", fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#0d1810", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 10, color: "#e8f2e8", fontFamily: "var(--font-syne)", fontSize: 12 }} />
                <Line type="monotone" dataKey="score" stroke="#34d399" strokeWidth={2.5} dot={{ fill: "#34d399", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Quick Start */}
        <div className="glass p-6 mb-8 animate-fadeUp">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-5" style={{ color: "#5a8a5a", fontFamily: "var(--font-mono)" }}>Start Interview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { href: "/interview?mode=video", icon: "🎥", label: "Video Call", desc: "Camera + mic", color: "#60a5fa" },
              { href: "/interview?mode=audio", icon: "🎙️", label: "Audio", desc: "Phone screen style", color: "#a78bfa" },
              { href: "/interview?mode=test", icon: "📝", label: "Written Test", desc: "Type your answers", color: "#34d399" },
            ].map((m) => (
              <Link key={m.href} href={m.href}
                className="p-4 rounded-2xl flex items-center gap-4 transition-all group"
                style={{ border: `1px solid ${m.color}22`, background: `${m.color}08` }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `${m.color}12`; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = `${m.color}08`; }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: `${m.color}15`, border: `1px solid ${m.color}30` }}>{m.icon}</div>
                <div>
                  <p className="font-bold text-sm" style={{ color: "#e8f2e8" }}>{m.label}</p>
                  <p className="text-xs" style={{ color: "#4a6a4a" }}>{m.desc}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <Link href="/resume-analyzer" className="btn-primary w-full block text-center">
              📄 Analyze Resume First →
            </Link>
          </div>
        </div>

        {/* Recent Sessions */}
        {sessions.length > 0 && (
          <div className="glass p-6 animate-fadeUp">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: "#5a8a5a", fontFamily: "var(--font-mono)" }}>Recent Sessions</h3>
              <Link href="/history" className="text-xs" style={{ color: "#34d399" }}>View All →</Link>
            </div>
            <div className="flex flex-col gap-3">
              {sessions.map((s) => (
                <Link key={s._id} href={`/results/${s._id}`}
                  className="flex items-center justify-between p-4 rounded-xl transition-all"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "rgba(52,211,153,0.04)"}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"}>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{modeIcon[s.mode]}</span>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#e8f2e8" }}>{s.jobRole}</p>
                      <p className="text-xs" style={{ color: "#4a6a4a" }}>
                        {new Date(s.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} • {s.mode}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black" style={{ color: gradeColor[s.report?.grade] || "#34d399", fontFamily: "var(--font-mono)" }}>
                      {s.report?.overallScore}
                    </span>
                    <span className="tag" style={{ background: `${gradeColor[s.report?.grade] || "#34d399"}18`, color: gradeColor[s.report?.grade] || "#34d399" }}>
                      {s.report?.grade}
                    </span>
                    <span style={{ color: "#3a5a3a", fontSize: 12 }}>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
