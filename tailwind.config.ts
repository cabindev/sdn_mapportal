// tailwind.config.ts
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
        sans: ["var(--font-prompt)", "Seppuri", "ui-sans-serif", "system-ui", "sans-serif"],
        seppuri: ["Seppuri", "sans-serif"],
        prompt: ["var(--font-prompt)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;