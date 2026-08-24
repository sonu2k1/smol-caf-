import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-fraunces)", "Playfair Display", "Georgia", "serif"],
        chalk: ["var(--font-caveat)", "cursive"],
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        cafe: {
          bg: "#F5EFEB",
          card: "#FCF8F2",
          border: "#E8DFD3",
          crimson: "#A62B34",
          darkCrimson: "#8C222A",
          text: "#1C1917",
          subtext: "#786F66",
          peach: "#FDF0E7",
          peachBorder: "#F3D8C7",
          peachText: "#8C3A27",
          seafoam: "#EBF3F4",
          seafoamBorder: "#D2E4E6",
          seafoamText: "#2C5860",
          ochre: "#FDF4DC",
          ochreBorder: "#F5E2B0",
          ochreText: "#7A5416",
          sage: "#EEF5EC",
          sageBorder: "#D8E7D5",
          sageText: "#385C38",
          blackboard: "#18191B",
        },
      },
    },
  },
  plugins: [],
};

export default config;

