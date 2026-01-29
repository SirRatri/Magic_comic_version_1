import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#ff4b1f", // Màu cam nổi bật cho nút đọc
        secondary: "#1f2937",
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'sans-serif'], // Font hiện đại
      },
    },
  },
  plugins: [],
};
export default config;