"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import type { Question, AnswerFeedback } from "@/types";
import { Timer } from "./Timer";

interface ModeProps {
  question: Question;
  questionNum: number;
  totalQuestions: number;
  prevScores: number[];
  onSubmit: (answer: string) => Promise<AnswerFeedback>;
}

const QuestionCard = ({ question, questionNum, total, color = "#34d399" }: { question: Question; questionNum: number; total: number; color?: string }) => {
  const typeColor: Record<string, string> = { technical: "#34d399", behavioral: "#60a5fa", situational: "#a78bfa", "culture-fit": "#fb923c", coding: "#fbbf24" };
  const diffColor: Record<string, string> = { easy: "#34d399", medium: "#fbbf24", hard: "#f87171" };
  
  return (
    <div style={{ background: `${color}06`, border: `1px solid ${color}18`, borderRadius: 14, padding: "16px 18px", marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span className="tag" style={{ background: `${typeColor[question.type] || color}18`, color: typeColor[question.type] || color }}>{question.type}</span>
          <span className="tag" style={{ background: `${diffColor[question.difficulty]}18`, color: diffColor[question.difficulty] }}>{question.difficulty}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Timer minutes={question.time_limit_minutes || 3} questionNum={questionNum} />
          <span style={{ fontSize: 11, color: "#2a4a2a", fontFamily: "var(--font-mono)", paddingLeft: 8, borderLeft: "1px solid rgba(255,255,255,0.1)" }}>Q{questionNum}/{total}</span>
        </div>
      </div>
      <p style={{ color: "#e8f2e8", fontSize: 16, lineHeight: 1.7, fontWeight: 600 }}>{question.question}</p>
      {question.hint && <p style={{ color: "#2a4a2a", fontSize: 12, marginTop: 8, fontStyle: "italic" }}>💡 {question.hint}</p>}
    </div>
  );
};

const ScoreDots = ({ scores }: { scores: number[] }) => {
  const getC = (s: number) => s >= 8 ? "#34d399" : s >= 6 ? "#fbbf24" : s >= 4 ? "#fb923c" : "#f87171";
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
      {scores.map((s, i) => (
        <div key={i} style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, fontFamily: "var(--font-mono)", background: `${getC(s)}18`, color: getC(s), border: `1px solid ${getC(s)}44` }}>{s}</div>
      ))}
    </div>
  );
};

// ─── Video Mode ────────────────────────────────────────────────────────────────
export function VideoModeUI({ question, questionNum, totalQuestions, prevScores, onSubmit }: ModeProps) {
  const recorder = useAudioRecorder();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [camStream, setCamStream] = useState<MediaStream | null>(null);
  const [camError, setCamError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [answer, setAnswer] = useState("");

  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    return () => {
      synthRef.current?.cancel();
    };
  }, []);

  const speakQuestion = useCallback(() => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(question.question);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    setTimeout(() => {
      const voices = synthRef.current?.getVoices() || [];
      const preferredVoice = voices.find(v => v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Enhanced"));
      if (preferredVoice) utterance.voice = preferredVoice;

      utterance.onstart = () => setIsAiSpeaking(true);
      utterance.onend = () => setIsAiSpeaking(false);
      utterance.onerror = () => setIsAiSpeaking(false);
      
      synthRef.current?.speak(utterance);
    }, 100);
  }, [question.question]);

  useEffect(() => {
    speakQuestion();
  }, [speakQuestion, questionNum]);

  const stopSpeaking = () => {
    synthRef.current?.cancel();
    setIsAiSpeaking(false);
  };

  useEffect(() => {
    navigator.mediaDevices?.getUserMedia({ video: true, audio: false })
      .then((stream) => { 
        setCamStream(stream); 
        setCamError(false);
        if (videoRef.current) videoRef.current.srcObject = stream; 
      })
      .catch(() => { setCamError(true); });
    return () => camStream?.getTracks().forEach((t) => t.stop());
  }, []);

  const handleStop = async () => {
    const text = await recorder.stopAndTranscribe();
    if (text) setAnswer((p) => (p ? p + " " + text : text));
  };

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setSubmitting(true);
    await onSubmit(answer.trim());
    setSubmitting(false);
    setAnswer("");
  };

  return (
    <div>
      {prevScores.length > 0 && <ScoreDots scores={prevScores} />}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {/* AI Interviewer */}
        <div style={{ background: "#0d1810", border: "1px solid rgba(96,165,250,0.2)", borderRadius: 14, aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ textAlign: "center", position: "relative" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(96,165,250,0.1)", border: "2px solid rgba(96,165,250,0.3)", margin: "0 auto 8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, position: "relative", zIndex: 2 }}>
              🤖
            </div>
            {isAiSpeaking && (
              <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%)", width: 70, height: 70, borderRadius: "50%", border: "2px solid #60a5fa", animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite", zIndex: 1, opacity: 0.5 }} />
            )}
            <p style={{ color: isAiSpeaking ? "#60a5fa" : "#4a6a8a", fontSize: 10, fontWeight: 700, letterSpacing: 1, fontFamily: "var(--font-mono)", transition: "color 0.3s" }}>SMART HIRE AI</p>
            
            <div style={{ display: "flex", gap: 3, justifySelf: "center", marginTop: 8, height: 12, alignItems: "center" }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{ 
                  width: 3, 
                  background: isAiSpeaking ? "#60a5fa" : "#1e3a5f", 
                  borderRadius: 2,
                  animation: isAiSpeaking ? `pulse-bar 0.${4+i}s ease-in-out infinite alternate` : "none",
                  height: isAiSpeaking ? "100%" : "30%"
                }} />
              ))}
            </div>
          </div>
          <div style={{ position: "absolute", bottom: 8, left: 8 }}>
            <span className="tag" style={{ background: isAiSpeaking ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.05)", color: isAiSpeaking ? "#34d399" : "#6a8a6a" }}>
               {isAiSpeaking ? "● LIVE" : "IDLE"}
            </span>
          </div>
        </div>
        {/* User Camera */}
        <div style={{ background: "#0a0d0a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, aspectRatio: "16/9", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          {camError ? (
            <div style={{ textAlign: "center", color: "#f87171" }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>🔕</div>
              <p style={{ fontSize: 10 }}>Camera Denied</p>
            </div>
          ) : camStream ? (
            <video ref={videoRef} autoPlay muted style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} />
          ) : (
            <div style={{ textAlign: "center", color: "#3a5a3a" }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>📷</div>
              <p style={{ fontSize: 10 }}>Loading Camera...</p>
            </div>
          )}
          {recorder.isRecording && (
            <div style={{ position: "absolute", top: 6, left: 6, display: "flex", alignItems: "center", gap: 4, background: "rgba(0,0,0,0.8)", borderRadius: 6, padding: "3px 7px" }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} className="record-pulse" />
              <span style={{ fontSize: 10, color: "#f87171", fontFamily: "var(--font-mono)" }}>{recorder.formattedTime}</span>
            </div>
          )}
        </div>
      </div>
      
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button onClick={speakQuestion} className="btn-ghost" style={{ fontSize: 11, padding: "6px 12px", background: "rgba(96,165,250,0.08)", color: "#60a5fa" }}>🔊 Replay Question</button>
        {isAiSpeaking && <button onClick={stopSpeaking} className="btn-ghost" style={{ fontSize: 11, padding: "6px 12px", background: "rgba(239,68,68,0.08)", color: "#f87171" }}>⏹ Stop</button>}
      </div>

      <QuestionCard question={question} questionNum={questionNum} total={totalQuestions} color="#60a5fa" />
      {/* Live transcript */}
      <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: 12, marginBottom: 14, minHeight: 60 }}>
        <p style={{ fontSize: 10, color: "#3a5a3a", marginBottom: 4, fontFamily: "var(--font-mono)" }}>TRANSCRIPT</p>
        <p style={{ fontSize: 13, color: recorder.liveTranscript || answer ? "#c8e0c8" : "#2a3a2a", lineHeight: 1.6 }}>
          {answer || recorder.liveTranscript || "Start recording to transcribe your speech..."}
        </p>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={recorder.isRecording ? handleStop : recorder.startRecording}
          disabled={recorder.isTranscribing}
          style={{ flex: 1, padding: "13px", borderRadius: 12, border: `1px solid ${recorder.isRecording ? "rgba(239,68,68,0.35)" : "rgba(96,165,250,0.25)"}`, background: recorder.isRecording ? "rgba(239,68,68,0.1)" : "rgba(96,165,250,0.08)", color: recorder.isRecording ? "#f87171" : "#60a5fa", fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          {recorder.isTranscribing ? "⏳ Transcribing..." : recorder.isRecording ? `⏹ Stop • ${recorder.formattedTime}` : "🎤 Record"}
        </button>
        <button onClick={handleSubmit} disabled={!answer.trim() || submitting}
          style={{ flex: 2, padding: "13px", borderRadius: 12, border: "none", background: answer.trim() ? "linear-gradient(135deg,#0d1e4a,#080f24)" : "rgba(255,255,255,0.04)", color: answer.trim() ? "#60a5fa" : "#1a2a3a", fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 14, cursor: answer.trim() ? "pointer" : "not-allowed" }}>
          {submitting ? "Evaluating..." : "Submit Answer →"}
        </button>
      </div>
    </div>
  );
}

// ─── Audio Mode ────────────────────────────────────────────────────────────────
export function AudioModeUI({ question, questionNum, totalQuestions, prevScores, onSubmit }: ModeProps) {
  const recorder = useAudioRecorder();
  const [submitting, setSubmitting] = useState(false);
  const [answer, setAnswer] = useState("");

  const handleStop = async () => {
    const text = await recorder.stopAndTranscribe();
    if (text) setAnswer((p) => (p ? p + " " + text : text));
  };

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setSubmitting(true);
    await onSubmit(answer.trim());
    setSubmitting(false);
    setAnswer("");
  };

  return (
    <div>
      {prevScores.length > 0 && <ScoreDots scores={prevScores} />}
      {/* Phone UI */}
      <div style={{ background: "radial-gradient(circle at 50% 0%, #120a24 0%, #080a0c 100%)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: 20, padding: "28px 20px", textAlign: "center", marginBottom: 14 }}>
        <div style={{ width: 68, height: 68, borderRadius: "50%", margin: "0 auto 12px", background: recorder.isRecording ? "rgba(239,68,68,0.1)" : "rgba(167,139,250,0.1)", border: `2px solid ${recorder.isRecording ? "#ef4444" : "#a78bfa"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, transition: "all 0.3s" }}>
          {recorder.isRecording ? "🔴" : "📞"}
        </div>
        <p style={{ color: recorder.isRecording ? "#f87171" : "#a78bfa", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
          {recorder.isTranscribing ? "Transcribing..." : recorder.isRecording ? "Recording" : "Phone Screen"}
        </p>
        {recorder.isRecording && <p style={{ color: "#3a3a4a", fontSize: 12, fontFamily: "var(--font-mono)", marginTop: 2 }}>{recorder.formattedTime}</p>}
        {/* Waveform */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2.5, height: 48, margin: "14px 0" }}>
          {recorder.waveData.map((h, i) => (
            <div key={i} style={{ width: 3, height: h, background: recorder.isRecording ? "#a78bfa" : "#1a1a2a", borderRadius: 2, transition: "height 0.05s ease" }} />
          ))}
        </div>
        <button onClick={recorder.isRecording ? handleStop : recorder.startRecording} disabled={recorder.isTranscribing}
          style={{ padding: "12px 28px", borderRadius: 100, border: `1px solid ${recorder.isRecording ? "rgba(239,68,68,0.4)" : "rgba(167,139,250,0.4)"}`, background: recorder.isRecording ? "rgba(239,68,68,0.1)" : "rgba(167,139,250,0.1)", color: recorder.isRecording ? "#f87171" : "#a78bfa", fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          {recorder.isRecording ? "⏹ End Call" : "📞 Start Call"}
        </button>
      </div>
      <QuestionCard question={question} questionNum={questionNum} total={totalQuestions} color="#a78bfa" />
      <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: 12, marginBottom: 14, minHeight: 60 }}>
        <p style={{ fontSize: 10, color: "#3a3a4a", marginBottom: 4, fontFamily: "var(--font-mono)" }}>YOUR RESPONSE</p>
        <p style={{ fontSize: 13, color: recorder.liveTranscript || answer ? "#c8c8e8" : "#2a2a3a", lineHeight: 1.6 }}>
          {answer || recorder.liveTranscript || "Speak your answer..."}
        </p>
      </div>
      <button onClick={handleSubmit} disabled={!answer.trim() || submitting}
        style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: answer.trim() ? "linear-gradient(135deg,#2a0d4a,#150826)" : "rgba(255,255,255,0.04)", color: answer.trim() ? "#a78bfa" : "#2a2a3a", fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 14, cursor: answer.trim() ? "pointer" : "not-allowed" }}>
        {submitting ? "Evaluating..." : "Submit Answer →"}
      </button>
    </div>
  );
}

// ─── Test Mode ─────────────────────────────────────────────────────────────────
export function TestModeUI({ question, questionNum, totalQuestions, prevScores, onSubmit }: ModeProps) {
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setSubmitting(true);
    await onSubmit(answer.trim());
    setSubmitting(false);
    setAnswer("");
  };

  return (
    <div>
      {prevScores.length > 0 && <ScoreDots scores={prevScores} />}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, padding: "8px 14px", background: "rgba(52,211,153,0.04)", border: "1px solid rgba(52,211,153,0.1)", borderRadius: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13 }}>📝</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#34d399", letterSpacing: 1, fontFamily: "var(--font-mono)" }}>WRITTEN TEST</span>
        </div>
      </div>
      <QuestionCard question={question} questionNum={questionNum} total={totalQuestions} />
      <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={7}
        className="input" placeholder="Write your detailed answer here..."
        style={{ resize: "vertical", lineHeight: 1.7, marginBottom: 6, width: "100%", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "12px", borderRadius: "12px" }} />
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontSize: 11, color: "#3a5a3a", fontFamily: "var(--font-mono)" }}>{wordCount} words</span>
        <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: wordCount >= 50 ? "#34d399" : "#3a5a3a" }}>
          {wordCount >= 50 ? "✓ Good length" : `${50 - wordCount} more words recommended`}
        </span>
      </div>
      <button onClick={handleSubmit} disabled={!answer.trim() || wordCount < 10 || submitting}
        className="btn-primary w-full" style={{ fontSize: 15, padding: "14px", borderRadius: "12px", background: answer.trim() && wordCount >= 10 ? "#34d399" : "rgba(255,255,255,0.1)", color: answer.trim() && wordCount >= 10 ? "#000" : "#666" }}>
        {submitting ? "Evaluating..." : "Submit Answer →"}
      </button>
    </div>
  );
}

export default VideoModeUI;
