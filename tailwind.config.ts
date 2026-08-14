import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          creme: "#F3E7D3",
          espresso: "#241F1C",
          cherry: "#B72E35",
          butter: "#F2C84B",
          biscuit: "#C9AE8B",
          walnut: "#725039",
          dustyPool: "#75AFA7",
          electricViolet: "#754CFF",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-eb-garamond)", "serif"],
        mono: ["var(--font-noto-mono)", "monospace"],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(36, 31, 28, 0.08)",
        card: "0 2px 10px rgba(36, 31, 28, 0.05)",
      },
      borderRadius: {
        arch: "100px 100px 0 0",
      },
    },
  },
  plugins: [],
};

export default config;
