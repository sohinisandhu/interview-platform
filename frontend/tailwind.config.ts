/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-syne)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        green: { 400: "#34d399", 500: "#10b981" },
        blue: { 400: "#60a5fa" },
        purple: { 400: "#a78bfa" },
      },
      animation: {
        "fade-up": "fadeUp 0.45s ease both",
        float: "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
