import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["var(--font-heading)", "Space Grotesk", "sans-serif"],
        body: ["var(--font-body)", "Inter", "sans-serif"],
      },
      colors: {
        primary:   { DEFAULT: "#06b6d4", foreground: "#030712" },
        secondary: { DEFAULT: "#8b5cf6" },
        accent:    { DEFAULT: "#10b981" },
        surface:   { DEFAULT: "rgba(255,255,255,0.035)" },
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      backgroundOpacity: {
        "3": "0.03",
        "8": "0.08",
      },
      animation: {
        "fade-in":        "fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "fade-in-up":     "fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "slide-up":       "slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "float":          "float 4s ease-in-out infinite",
        "float-slow":     "float-slow 6s ease-in-out infinite",
        "pulse-glow":     "pulse-glow 2.5s ease-in-out infinite",
        "spin-slow":      "spin-slow 12s linear infinite",
        "spin-reverse":   "spin-reverse 8s linear infinite",
        "scale-in":       "scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "bounce-subtle":  "bounce-subtle 2s ease-in-out infinite",
        "shimmer":        "shimmer 2.5s infinite",
        "gradient-scroll":"gradient-scroll 6s linear infinite",
        "radar-sweep":    "radar-sweep 2.4s linear infinite",
        "aurora-drift":   "aurora-drift 18s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeIn:          { from: { opacity: "0" }, to: { opacity: "1" } },
        fadeInUp:        { from: { opacity: "0", transform: "translateY(24px) scale(0.97)" }, to: { opacity: "1", transform: "translateY(0) scale(1)" } },
        slideUp:         { from: { opacity: "0", transform: "translateY(40px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        float:           { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } },
        "float-slow":    { "0%, 100%": { transform: "translateY(0) rotate(0deg)" }, "50%": { transform: "translateY(-18px) rotate(5deg)" } },
        "pulse-glow":    { "0%, 100%": { opacity: "1", filter: "brightness(1)" }, "50%": { opacity: "0.7", filter: "brightness(1.3)" } },
        "spin-slow":     { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } },
        "spin-reverse":  { from: { transform: "rotate(360deg)" }, to: { transform: "rotate(0deg)" } },
        "scale-in":      { from: { transform: "scale(0.8)", opacity: "0" }, to: { transform: "scale(1)", opacity: "1" } },
        "bounce-subtle": { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-6px)" } },
        shimmer:         { "0%": { backgroundPosition: "-1000px 0" }, "100%": { backgroundPosition: "1000px 0" } },
        "gradient-scroll":{ "0%": { backgroundPosition: "0% center" }, "100%": { backgroundPosition: "300% center" } },
        "radar-sweep":   { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } },
        "aurora-drift":  {
          "0%":   { transform: "translate(0px, 0px) scale(1)" },
          "33%":  { transform: "translate(60px, -40px) scale(1.1)" },
          "66%":  { transform: "translate(-40px, 60px) scale(0.9)" },
          "100%": { transform: "translate(30px, 30px) scale(1.05)" },
        },
      },
      boxShadow: {
        "glow-cyan":    "0 0 30px rgba(6,182,212,0.25), 0 0 60px rgba(6,182,212,0.1)",
        "glow-violet":  "0 0 30px rgba(139,92,246,0.25), 0 0 60px rgba(139,92,246,0.1)",
        "glow-emerald": "0 0 30px rgba(16,185,129,0.25), 0 0 60px rgba(16,185,129,0.1)",
        "card":         "0 4px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.05) inset",
      },
    },
  },
  plugins: [],
};

export default config;
