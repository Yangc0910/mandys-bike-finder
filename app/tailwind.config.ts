import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14213d",
        muted: "#7b8daa",
        line: "#dce5f5",
        page: "#f6f9ff",
        brand: {
          DEFAULT: "#2f6fed",
          hover: "#245bd1",
        },
        teal: "#0fa7a0",
        good: "#1f9d55",
        success: "#1f9d55",
        caution: "#e9a23b",
        warning: "#e9a23b",
        danger: "#d64545",
        surface: {
          DEFAULT: "#ffffff",
          blue: "#eef6ff",
          green: "#ecfdf5",
          amber: "#fff7e8",
          red: "#fef2f2",
        },
      },
      borderRadius: {
        input: "8px",
        button: "10px",
        card: "12px",
        section: "16px",
      },
      boxShadow: {
        panel: "0 6px 20px rgba(20, 33, 61, 0.08)",
        "panel-hover": "0 10px 28px rgba(20, 33, 61, 0.12)",
        soft: "0 18px 48px rgba(47, 111, 237, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
