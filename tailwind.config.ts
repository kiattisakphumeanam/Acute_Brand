import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Brand breakpoints — tablet 760px, desktop 1040px
      screens: {
        tab: "760px",
        desk: "1040px",
      },
      colors: {
        acute: {
          red: "#AE3C31", // primary — buttons, active states, highlights
          "red-dark": "#8E3028", // hover state for primary
          "red-light": "#C96961",
          blue: "#DCE7F2", // secondary — soft sections, cards
          "blue-dark": "#B7C9DB",
          "blue-light": "#EEF4F9",
          cream: "#F7F3EE", // neutral light — page background
          "cream-light": "#FBF8F5",
          sand: "#EDE6DC", // slightly deeper cream for placeholders
          ink: "#2F3135", // neutral dark — text, icons
          "ink-light": "#4A4D51",
          stone: "#B7AFA6", // support grey — borders, dividers, tags
          line: "#e4ddd5", // hairlines
        },
      },
      borderRadius: {
        card: "22px 22px 0 22px",
        arch: "999px 999px 0 0",
      },
      // Brand type scale: display sizes sit at 90–110% leading, body copy at ~140%
      fontSize: {
        "display-xl": ["clamp(3rem, 7vw, 5.5rem)", { lineHeight: "0.9", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(2.5rem, 5vw, 4rem)", { lineHeight: "0.9", letterSpacing: "-0.015em" }],
        "display-md": ["clamp(2rem, 3.5vw, 2.75rem)", { lineHeight: "0.95", letterSpacing: "-0.01em" }],
        "display-sm": ["1.5rem", { lineHeight: "1.05", letterSpacing: "-0.01em" }],
        "body-lg": ["1.125rem", { lineHeight: "1.4" }],
        body: ["1rem", { lineHeight: "1.4" }],
        "body-sm": ["0.875rem", { lineHeight: "1.4" }],
        label: ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.24em" }],
      },
      lineHeight: {
        heading: "0.9",
        body: "1.4",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "var(--font-thai)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "var(--font-thai)", "system-ui", "sans-serif"],
      },
      transitionTimingFunction: {
        soft: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "badge-pop": {
          "0%": { transform: "scale(0.6)" },
          "60%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)" },
        },
        "drawer-in": {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(-6deg)" },
          "50%": { transform: "translateY(-10px) rotate(-2deg)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "badge-pop": "badge-pop 400ms cubic-bezier(0.22, 1, 0.36, 1)",
        "drawer-in": "drawer-in 400ms cubic-bezier(0.22, 1, 0.36, 1) both",
        marquee: "marquee 38s linear infinite",
        "marquee-slow": "marquee 60s linear infinite",
        float: "float 6s ease-in-out infinite",
        "fade-up": "fade-up 500ms cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
