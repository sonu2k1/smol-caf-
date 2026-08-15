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
          cremeMuted: "#E9DAC3",
          espresso: "#121010",
          espressoLight: "#1C1817",
          espressoCard: "#241F1C",
          cherry: "#B72E35",
          cherryGlow: "#D6343C",
          butter: "#F2C84B",
          biscuit: "#C9AE8B",
          walnut: "#725039",
          dustyPool: "#75AFA7",
          electricViolet: "#754CFF",
          neonPurple: "#9D4EDD",
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
        neonViolet: "0 0 20px rgba(117, 76, 255, 0.35)",
        neonCherry: "0 0 20px rgba(183, 46, 53, 0.4)",
        neonGold: "0 0 15px rgba(242, 200, 75, 0.3)",
      },
      borderRadius: {
        arch: "120px 120px 0 0",
        archSm: "60px 60px 0 0",
      },
    },
  },
  plugins: [],
};

export default config;
