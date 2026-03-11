"use client";

export default function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(8,9,12,0.97)", backdropFilter: "blur(12px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div className="animate-fadeUp text-center">
        <div className="animate-float" style={{ marginBottom: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
            <div style={{ width: 36, height: 36, border: "2.5px solid rgba(52,211,153,0.15)", borderTopColor: "#34d399", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          </div>
        </div>
        <p style={{ color: "#34d399", fontSize: 16, fontWeight: 700 }}>{message}</p>
        <p style={{ color: "#2a4a2a", fontSize: 13, marginTop: 6 }}>AI is working...</p>
      </div>
    </div>
  );
}
