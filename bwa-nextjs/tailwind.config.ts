import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-deep":    "#080a0f",
        "bg-surface": "#0f1117",
        "bg-card":    "#151821",
        border:       "#1e2535",
        cyan:         "#00d9ff",
        amber:        "#f59e0b",
        green:        "#22d3a5",
        purple:       "#c084fc",
      },
      fontFamily: {
        syne:   ["var(--font-syne)"],
        outfit: ["var(--font-outfit)"],
        mono:   ["var(--font-mono)"],
      },
    },
  },
  plugins: [],
};
export default config;
