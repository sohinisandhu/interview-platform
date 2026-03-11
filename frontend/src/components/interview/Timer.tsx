"use client";
import { useEffect, useState } from "react";

interface TimerProps {
  minutes: number;
  questionNum: number;
}

export function Timer({ minutes, questionNum }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(minutes * 60);

  useEffect(() => {
    setTimeLeft(minutes * 60);
  }, [minutes, questionNum]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((p) => p - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const total = minutes * 60;
  const progress = timeLeft / total;
  
  const getColor = () => {
    if (progress > 0.5) return "#34d399"; // Green
    if (progress > 0.25) return "#fbbf24"; // Yellow
    return "#f87171"; // Red
  };
  
  const color = getColor();
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {timeLeft === 0 && (
        <div style={{ background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.3)", padding: "4px 10px", borderRadius: 8 }}>
          <span style={{ fontSize: 11, color: "#f87171", fontWeight: 700 }}>⏰ Time's up! Please submit.</span>
        </div>
      )}
      
      <div style={{ position: "relative", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="40" height="40" style={{ transform: "rotate(-90deg)", position: "absolute" }}>
          <circle cx="20" cy="20" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
          <circle 
            cx="20" 
            cy="20" 
            r={radius} 
            fill="none" 
            stroke={color} 
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s linear, stroke 1s ease" }}
          />
        </svg>
        <span style={{ fontSize: 10, fontWeight: 700, color, fontFamily: "var(--font-mono)" }}>{timeStr}</span>
      </div>
    </div>
  );
}
