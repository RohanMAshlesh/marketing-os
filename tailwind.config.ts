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
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        "flow-dot": {
          "0%": { left: "0%", opacity: "0" },
          "5%": { opacity: "1" },
          "95%": { opacity: "1" },
          "100%": { left: "100%", opacity: "0" },
        },
        "node-pulse": {
          "0%": { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(79,70,229,0)" },
          "6%": { transform: "scale(1.15)", boxShadow: "0 0 0 8px rgba(79,70,229,0.15)" },
          "16%": { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(79,70,229,0)" },
          "100%": { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(79,70,229,0)" },
        },
      },
      animation: {
        "flow-dot": "flow-dot 7s linear infinite",
        "node-pulse": "node-pulse 7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
