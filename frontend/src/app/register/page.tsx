"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { authAPI } from "@/lib/api";
import { useAuthStore } from "@/store";

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const { data } = await authAPI.register(form);
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success("Account created! Let's get started.");
      router.replace("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5" style={{ background: "#08090c" }}>
      <div style={{ position: "absolute", width: 500, height: 500, background: "#0a1a4a", borderRadius: "50%", filter: "blur(120px)", opacity: 0.08, bottom: 0, right: -100 }} />

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
          <p className="text-sm" style={{ color: "#4a6a4a" }}>Create an account to start practicing</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {[
            { key: "name", label: "Full Name", type: "text", placeholder: "John Doe" },
            { key: "email", label: "Email", type: "email", placeholder: "you@example.com" },
            { key: "password", label: "Password", type: "password", placeholder: "Min 6 characters" },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#5a8a5a", fontFamily: "var(--font-mono)" }}>{label}</label>
              <input type={type} className="input" value={(form as any)[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder} required />
            </div>
          ))}

          <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
            {loading ? "Creating account..." : "Create Account →"}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: "#4a6a4a" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#34d399", fontWeight: 700 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
