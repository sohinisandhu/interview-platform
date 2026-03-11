"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { resumeAPI } from "@/lib/api";
import { useInterviewStore } from "@/store";
import type { ResumeAnalysis } from "@/types";
import Link from "next/link";

const ProgressBar = ({ value, color = "#34d399" }: { value: number; color?: string }) => (
  <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
    <div style={{ height: 6, width: `${value}%`, background: color, borderRadius: 3, transition: "width 1s ease", boxShadow: `0 0 8px ${color}55` }} />
  </div>
);

const ScoreRing = ({ score, size = 80 }: { score: number; size?: number }) => {
  const c = score >= 80 ? "#34d399" : score >= 60 ? "#fbbf24" : score >= 40 ? "#fb923c" : "#f87171";
  const r = size / 2 - 7;
  const circ = 2 * Math.PI * r;
  const dash = circ * (score / 100);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 5px ${c}55)` }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: size * 0.24, fontWeight: 900, color: c, fontFamily: "var(--font-mono)" }}>{score}</span>
        <span style={{ fontSize: 9, color: c, opacity: 0.7 }}>/ 100</span>
      </div>
    </div>
  );
};

export default function ResumeAnalyzerPage() {
  const router = useRouter();
  const { setResumeData, setJobData, setResumeAnalysis, resumeAnalysis } = useInterviewStore();

  const [file, setFile] = useState<File | null>(null);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [jobRole, setJobRole] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(resumeAnalysis);

  const onDrop = useCallback(async (files: File[]) => {
    if (!files[0]) return;
    setFile(files[0]);
    setUploading(true);
    setUploadProgress(0);
    try {
      const { data } = await resumeAPI.upload(files[0], setUploadProgress);
      setResumeId(data.resumeId);
      setResumeData(data.resumeId, files[0].name);
      toast.success(`Resume parsed! ${data.wordCount} words extracted.`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Upload failed.");
      setFile(null);
    } finally {
      setUploading(false);
    }
  }, [setResumeData]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { "application/pdf": [".pdf"], "text/plain": [".txt"] },
    maxFiles: 1, maxSize: 10 * 1024 * 1024,
  });

  const handleAnalyze = async () => {
    if (!resumeId || !jobRole || !jobDesc) return;
    setAnalyzing(true);
    try {
      const { data } = await resumeAPI.analyze({ resumeId, jobDescription: jobDesc, jobRole });
      setAnalysis(data.analysis);
      setResumeAnalysis(data.analysis);
      setJobData(jobRole, jobDesc);
      toast.success("Analysis complete!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (v: number) => v >= 80 ? "#34d399" : v >= 60 ? "#fbbf24" : v >= 40 ? "#fb923c" : "#f87171";

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
        <div className="flex gap-2">
          <Link href="/dashboard" className="btn-ghost text-sm py-2">← Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-5 py-8">
        <div className="mb-8 animate-fadeUp">
          <h1 className="text-3xl font-black mb-1" style={{ color: "#f0f2f0" }}>Resume Analyser</h1>
          <p className="text-sm" style={{ color: "#4a6a4a" }}>Upload resume + paste JD → get detailed match analysis before your interview</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Input */}
          <div className="flex flex-col gap-5">
            {/* Upload */}
            <div className="glass p-6 animate-fadeUp">
              <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: "#5a8a5a", fontFamily: "var(--font-mono)" }}>1. Upload Resume</h2>
              <div {...getRootProps()} className="rounded-2xl p-8 text-center cursor-pointer transition-all"
                style={{
                  border: `2px dashed ${isDragActive ? "#34d399" : file ? "rgba(52,211,153,0.4)" : "rgba(52,211,153,0.15)"}`,
                  background: file ? "rgba(52,211,153,0.03)" : isDragActive ? "rgba(52,211,153,0.05)" : "transparent"
                }}>
                <input {...getInputProps()} />
                {uploading ? (
                  <div>
                    <div className="text-2xl mb-2">⏳</div>
                    <p style={{ color: "#34d399", fontWeight: 600 }}>Uploading... {uploadProgress}%</p>
                    <div className="mt-3"><ProgressBar value={uploadProgress} /></div>
                  </div>
                ) : file ? (
                  <div>
                    <div className="text-3xl mb-2">✅</div>
                    <p style={{ color: "#34d399", fontWeight: 700 }}>{file.name}</p>
                    <p className="text-xs mt-1" style={{ color: "#3a5a3a" }}>Click to change file</p>
                  </div>
                ) : (
                  <div>
                    <div className="text-4xl mb-3 opacity-40">📄</div>
                    <p className="font-semibold" style={{ color: "#6a8a6a" }}>
                      {isDragActive ? "Drop here!" : "Drag & drop your resume"}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#3a5a3a" }}>PDF, TXT • Max 10MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Job Details */}
            <div className="glass p-6 animate-fadeUp">
              <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: "#5a8a5a", fontFamily: "var(--font-mono)" }}>2. Job Details</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#4a6a4a", fontFamily: "var(--font-mono)" }}>Job Role *</label>
                  <input className="input" value={jobRole} onChange={(e) => setJobRole(e.target.value)}
                    placeholder="e.g. Senior React Developer, Data Scientist..." />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#4a6a4a", fontFamily: "var(--font-mono)" }}>Job Description *</label>
                  <textarea className="input" rows={7} value={jobDesc} onChange={(e) => setJobDesc(e.target.value)}
                    placeholder="Paste the full job description — requirements, responsibilities, skills needed..."
                    style={{ resize: "vertical", lineHeight: 1.7 }} />
                </div>
                <button className="btn-primary w-full" onClick={handleAnalyze}
                  disabled={!resumeId || !jobRole.trim() || !jobDesc.trim() || analyzing}>
                  {analyzing ? "🔍 Analyzing..." : "🔍 Analyze Match →"}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Analysis Results */}
          <div className="flex flex-col gap-5">
            {!analysis ? (
              <div className="glass p-8 flex flex-col items-center justify-center text-center" style={{ minHeight: 400 }}>
                <div className="text-5xl mb-4 animate-float">🎯</div>
                <h3 className="font-bold mb-2" style={{ color: "#4a6a4a" }}>Analysis will appear here</h3>
                <p className="text-sm" style={{ color: "#2a4a2a" }}>Upload resume and paste JD to get started</p>
              </div>
            ) : (
              <>
                {/* Score Overview */}
                <div className="glass p-6 animate-fadeUp">
                  <h3 className="text-sm font-bold uppercase tracking-widest mb-5" style={{ color: "#5a8a5a", fontFamily: "var(--font-mono)" }}>Match Analysis</h3>
                  <div className="flex justify-around mb-6">
                    <div className="text-center">
                      <ScoreRing score={analysis.overall_score} size={80} />
                      <p className="text-xs mt-2" style={{ color: "#5a8a5a" }}>Overall</p>
                    </div>
                    <div className="text-center">
                      <ScoreRing score={analysis.jd_match_score} size={80} />
                      <p className="text-xs mt-2" style={{ color: "#5a8a5a" }}>JD Match</p>
                    </div>
                    <div className="flex flex-col justify-center items-center">
                      <div className="px-3 py-2 rounded-xl text-center" style={{
                        background: analysis.hire_likelihood === "High" ? "rgba(52,211,153,0.1)" : analysis.hire_likelihood === "Medium" ? "rgba(251,191,36,0.1)" : "rgba(248,113,113,0.1)",
                        border: `1px solid ${analysis.hire_likelihood === "High" ? "rgba(52,211,153,0.3)" : analysis.hire_likelihood === "Medium" ? "rgba(251,191,36,0.3)" : "rgba(248,113,113,0.3)"}`
                      }}>
                        <div className="text-xl font-black" style={{ color: analysis.hire_likelihood === "High" ? "#34d399" : analysis.hire_likelihood === "Medium" ? "#fbbf24" : "#f87171" }}>
                          {analysis.hire_likelihood}
                        </div>
                        <div className="text-xs mt-1" style={{ color: "#4a6a4a" }}>Hire Chance</div>
                      </div>
                    </div>
                  </div>

                  {/* Skill breakdown */}
                  {analysis.skill_scores && (
                    <div className="flex flex-col gap-3">
                      {Object.entries(analysis.skill_scores).map(([k, v]) => (
                        <div key={k}>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span style={{ color: "#8aa88a", textTransform: "capitalize" }}>{k.replace(/_/g, " ")}</span>
                            <span style={{ color: getScoreColor(v as number), fontFamily: "var(--font-mono)", fontWeight: 700 }}>{v as number}%</span>
                          </div>
                          <ProgressBar value={v as number} color={getScoreColor(v as number)} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Skills Match */}
                <div className="grid grid-cols-2 gap-4 animate-fadeUp">
                  <div className="glass-sm p-4">
                    <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#34d399", fontFamily: "var(--font-mono)" }}>✅ Matched</p>
                    {analysis.matched_skills?.map((s, i) => (
                      <p key={i} className="text-xs mb-2" style={{ color: "#7aaa7a" }}>• {s}</p>
                    ))}
                  </div>
                  <div className="glass-sm p-4">
                    <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#f87171", fontFamily: "var(--font-mono)" }}>❌ Missing</p>
                    {analysis.missing_skills?.map((s, i) => (
                      <p key={i} className="text-xs mb-2" style={{ color: "#9a7070" }}>• {s}</p>
                    ))}
                  </div>
                </div>

                {/* Strengths + Improvements */}
                <div className="glass p-5 animate-fadeUp">
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#60a5fa", fontFamily: "var(--font-mono)" }}>💪 Key Strengths</p>
                  {analysis.strengths?.map((s, i) => <p key={i} className="text-sm mb-2 leading-relaxed" style={{ color: "#90b8e0" }}>→ {s}</p>)}
                  <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#fbbf24", fontFamily: "var(--font-mono)" }}>🔧 Improvements</p>
                    {analysis.improvement_areas?.map((s, i) => <p key={i} className="text-sm mb-2 leading-relaxed" style={{ color: "#c8a870" }}>→ {s}</p>)}
                  </div>
                </div>

                {/* ATS Tips */}
                <div className="animate-fadeUp" style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.15)", borderRadius: 16, padding: 20 }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#fbbf24", fontFamily: "var(--font-mono)" }}>🤖 ATS Tips</p>
                  {analysis.ats_tips?.map((s, i) => <p key={i} className="text-sm mb-2" style={{ color: "#c8a870" }}>• {s}</p>)}
                </div>

                {/* Assessment */}
                <div className="glass p-5 animate-fadeUp">
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#a78bfa", fontFamily: "var(--font-mono)" }}>📋 Overall Assessment</p>
                  <p className="text-sm leading-relaxed" style={{ color: "#b0a0d8" }}>{analysis.overall_assessment}</p>
                </div>

                {/* CTA */}
                <div className="grid grid-cols-1 gap-3 animate-fadeUp">
                  <Link href="/interview" className="btn-primary text-center block">
                    Start Interview Based on This Analysis →
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
