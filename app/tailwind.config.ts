import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17202a",
        muted: "#5f6f7f",
        line: "#d8e0e7",
        page: "#f4f7f9",
        brand: "#2764c5",
        good: "#198754",
        caution: "#b7791f",
        danger: "#c24135",
      },
      boxShadow: {
        panel: "0 10px 30px rgba(22, 38, 55, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
