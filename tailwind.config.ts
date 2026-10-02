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
        swu: {
          red: "#DA2128",        // Official SWU Red (HEX: #DA2128, RGB: 218, 33, 40)
          redHover: "#B81B22",
          redDark: "#8F1319",
          redLight: "#FFEBEC",
          gray: "#636466",       // Official SWU Gray (HEX: #636466, RGB: 99, 100, 102)
          grayLight: "#EBECEE",
          grayDark: "#37383A",
          darkBg: "#121315",
          darkCard: "#1B1C1E",
          darkBorder: "#2D2F33"
        }
      },
    },
  },
  plugins: [],
};
export default config;
