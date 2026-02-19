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
        sans: ["Inter", "sans-serif"],
        display: ["Bricolage Grotesque", "sans-serif"],
      },
      colors: {
        primary: "#6366f1", // Indigo 500
        secondary: "#10b981", // Emerald 500
        accent: "#f43f5e", // Rose 500
        warning: "#f59e0b", // Amber 500
        dark: "#1e293b",
        light: "#f8fafc",
      },
      boxShadow: {
        neo: "4px 4px 0px 0px rgba(0,0,0,1)",
        "neo-sm": "2px 2px 0px 0px rgba(0,0,0,1)",
      },
    },
  },
  plugins: [],
};

export default config;
