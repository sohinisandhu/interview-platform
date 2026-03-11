import type { Metadata } from "next";
import { Syne, JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const syne = Syne({ subsets: ["latin"], variable: "--font-syne", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap", weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "Smart Hire",
  description: "Practice interviews with AI — Resume analysis, JD matching, and 3 interview modes.",
  keywords: ["interview", "AI", "resume", "job preparation"],
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${mono.variable}`}>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#0d1810",
              color: "#e8f2e8",
              border: "1px solid rgba(52,211,153,0.2)",
              borderRadius: "12px",
              fontFamily: "var(--font-syne)",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#34d399", secondary: "#0d1810" } },
            error: { iconTheme: { primary: "#f87171", secondary: "#0d1810" } },
            loading: { iconTheme: { primary: "#60a5fa", secondary: "#0d1810" } },
          }}
        />
      </body>
    </html>
  );
}
