"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { authAPI } from "@/lib/api";
import { useAuthStore } from "@/store";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.login(form);
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success(`Welcome back, ${data.user.name}!`);
      router.replace("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5" style={{ background: "#08090c" }}>
      <div style={{ position: "absolute", width: 500, height: 500, background: "#0a3a1a", borderRadius: "50%", filter: "blur(120px)", opacity: 0.1, top: -100, left: -100 }} />

      <div className="glass p-10 w-full max-w-md animate-fadeUp relative z-10">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="mb-4">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="url(#paint0_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          </div>
          <h1 className="text-2xl font-black shimmer-text mb-1 tracking-tight" style={{ fontFamily: "var(--font-syne)" }}>Smart Hire</h1>
          <p className="text-sm" style={{ color: "#4a6a4a" }}>Sign in to continue your prep</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#5a8a5a", fontFamily: "var(--font-mono)" }}>Email</label>
            <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com" required />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#5a8a5a", fontFamily: "var(--font-mono)" }}>Password</label>
            <input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••" required />
          </div>

          <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: "#4a6a4a" }}>
          Don't have an account?{" "}
          <Link href="/register" style={{ color: "#34d399", fontWeight: 700 }}>Register</Link>
        </p>
      </div>
    </div>
  );
}
