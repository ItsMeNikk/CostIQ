import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#C5D0D8",
          dark: "#04080F",
          primary: "#4A70B0",
          light: "#8BB4DC",
          soft: "#A8BDE0",
          white: "#FFFFFF",
          deep: "#3E5F96",
          accent: "#6B91C4",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      borderRadius: {
        "2xl": "0.875rem",
        "3xl": "1.25rem",
        "4xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 1px 3px rgba(4,8,15,0.08), 0 4px 16px rgba(4,8,15,0.06)",
        "soft-md": "0 2px 8px rgba(4,8,15,0.08), 0 8px 24px rgba(4,8,15,0.08)",
        "soft-lg": "0 4px 20px rgba(4,8,15,0.1), 0 16px 48px rgba(4,8,15,0.1)",
        "soft-xl": "0 8px 32px rgba(4,8,15,0.12), 0 24px 64px rgba(4,8,15,0.14)",
        card: "0 1px 2px rgba(4,8,15,0.04), 0 4px 12px rgba(4,8,15,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
        "card-hover": "0 8px 32px rgba(4,8,15,0.12), 0 24px 64px rgba(4,8,15,0.1), inset 0 1px 0 rgba(255,255,255,0.9)",
        glow: "0 0 40px rgba(74,112,176,0.18)",
        "glow-lg": "0 0 80px rgba(74,112,176,0.22)",
        "glow-xl": "0 0 120px rgba(74,112,176,0.28)",
        "btn-primary": "0 2px 8px rgba(74,112,176,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
        "btn-primary-hover": "0 4px 20px rgba(74,112,176,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(rgba(74,112,176,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(74,112,176,0.04) 1px, transparent 1px)",
        "gradient-primary": "linear-gradient(135deg, #4A70B0 0%, #3E5F96 100%)",
        "gradient-primary-hover": "linear-gradient(135deg, #4A70B0 0%, #365580 100%)",
        "gradient-light": "linear-gradient(135deg, #8BB4DC 0%, #A8BDE0 100%)",
        "gradient-surface": "linear-gradient(180deg, #C5D0D8 0%, #B8C4CE 100%)",
        "gradient-card": "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)",
        "gradient-hero": "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(74,112,176,0.12) 0%, transparent 60%), linear-gradient(180deg, #C5D0D8 0%, #B8C4CE 100%)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 8s ease-in-out infinite",
        "float-slower": "float 10s ease-in-out infinite",
        pulse: "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;