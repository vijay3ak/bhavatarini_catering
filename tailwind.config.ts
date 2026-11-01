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
          green: "#123c2c",
          green2: "#1c573e",
          leaf: "#718b62",
          cream: "#faf8f1",
          cream2: "#eee7d7",
          gold: "#c7a45b",
          goldLight: "#e2ce94",
          goldDark: "#997b3e",
          ink: "#17271e",
          muted: "#6f786f",
          line: "#e5dece",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "Arial", "sans-serif"],
      },
      maxWidth: {
        container: "1240px",
      },
      boxShadow: {
        card: "0 10px 28px rgba(24, 52, 35, 0.045)",
        cardHover: "0 24px 48px rgba(24, 52, 35, 0.12)",
        float: "0 8px 25px rgba(0, 0, 0, 0.16)",
      },
    },
  },
  plugins: [],
};

export default config;
