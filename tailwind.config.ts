import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050505", // Đen sâu thẳm (Super AMOLED Black)
        surface: "#121212",    // Màu nền các thẻ
        surfaceHighlight: "#1E1E1E",
        primary: {
          DEFAULT: "#ff3d00", // Màu cam cháy chủ đạo (Brand Color)
          glow: "#ff3d00",
        },
        text: {
          main: "#ffffff",
          muted: "#a1a1aa",
        }
      },
      // Animation mượt mà
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'neon': '0 0 20px -5px rgba(255, 61, 0, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
};
export default config;