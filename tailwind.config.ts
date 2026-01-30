import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import plugin from "tailwindcss/plugin";

const config: Config = {
  // Chế độ tối: Dùng 'class' để kiểm soát thủ công hoặc khớp với globals.css
  darkMode: "class",

  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // 1. MAPPING FONT CHỮ (Từ layout.tsx)
      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans], // Outfit
        mono: ["var(--font-mono)", ...defaultTheme.fontFamily.mono], // Space Grotesk
      },

      // 2. MAPPING MÀU SẮC (Từ globals.css)
      // Sử dụng cú pháp rgb(var(...) / <alpha>) để hỗ trợ opacity trong Tailwind
      colors: {
        // Màu nền tảng
        background: "rgb(var(--background) / <alpha-value>)", // #050505
        foreground: "rgb(var(--foreground) / <alpha-value>)", // #fafafa
        
        // Màu thương hiệu
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)", // #ff4b1f (Cam Cháy)
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary) / <alpha-value>)", // #7c3aed (Tím Cyber)
          foreground: "#ffffff",
        },

        // Các lớp bề mặt (Surface Layers)
        surface: {
          1: "rgb(var(--surface-1) / <alpha-value>)",
          2: "rgb(var(--surface-2) / <alpha-value>)",
          3: "rgb(var(--surface-3) / <alpha-value>)",
          glass: "var(--surface-glass)", // Đã có alpha sẵn trong CSS
        },

        // Trạng thái (Status)
        success: "rgb(var(--success) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",

        // Border & Input
        border: "var(--border-color)",
      },

      // 3. SPACING & RADIUS (Từ globals.css)
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        full: "var(--radius-full)",
      },

      // 4. SHADOWS (Hiệu ứng Neon)
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        neon: "var(--shadow-neon)", // Glow cam
        "neon-strong": "var(--shadow-neon-strong)", // Glow mạnh
      },

      // 5. ANIMATIONS (Map từ globals.css keyframes)
      // Khai báo lại ở đây để Tailwind gợi ý class (vd: animate-glitch)
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translate3d(0, 40px, 0)" },
          "100%": { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
        glitch: {
          "0%, 100%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(-2px, -2px)" },
          "60%": { transform: "translate(2px, 2px)" },
          "80%": { transform: "translate(2px, -2px)" },
        },
        pulseNeon: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(var(--primary-rgb), 0.2)" },
          "50%": { boxShadow: "0 0 30px rgba(var(--primary-rgb), 0.6)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-150%)" },
          "100%": { transform: "translateX(150%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "in-up": "fadeInUp 0.8s var(--ease-smooth) forwards",
        glitch: "glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite",
        "pulse-neon": "pulseNeon 3s infinite",
        "pulse-slow": "pulseNeon 4s infinite", // Dùng cho background orbs trong layout
        shimmer: "shimmer 1.5s infinite",
        float: "float 6s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
      },

      // 6. Easing (Đường cong chuyển động)
      transitionTimingFunction: {
        elastic: "var(--ease-elastic)",
        squish: "var(--ease-squish)",
        smooth: "var(--ease-smooth)",
      },

      // 7. Z-INDEX (Hệ thống lớp)
      zIndex: {
        negative: "var(--z-negative)",
        sticky: "var(--z-sticky)",
        drawer: "var(--z-drawer)",
        modal: "var(--z-modal)",
        toast: "var(--z-toast)",
        cursor: "var(--z-cursor)",
      },

      // 8. MOBILE OPTIMIZATION
      screens: {
        'xs': '375px', // iPhone SE / Mini
        'touch': { 'raw': '(hover: none) and (pointer: coarse)' }, // Thiết bị cảm ứng
      },
      height: {
        'screen-dvh': '100dvh', // Fix lỗi thanh địa chỉ nhảy trên iOS
      },
    },
  },

  plugins: [
    require("tailwindcss-animate"),
    require("tailwind-scrollbar-hide"),
    
    // Custom Plugin: Thêm các Utilities đặc biệt từ CSS của bạn
    plugin(function({ addUtilities }) {
      addUtilities({
        // Typography
        '.text-balance': { 'text-wrap': 'balance' },
        '.text-glow': { 'text-shadow': '0 0 10px rgba(255,255,255,0.3)' },
        
        // Rendering Performance
        '.render-lazy': { 'content-visibility': 'auto' },
        '.gpu': { 
          'transform': 'translateZ(0)',
          'backface-visibility': 'hidden',
          'perspective': '1000px',
        },

        // Mobile Touch Area
        '.hit-area': {
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '-12px', bottom: '-12px', left: '-12px', right: '-12px',
          }
        },
        '.touch-manipulation': { 'touch-action': 'manipulation' },
      })
    }),
  ],
};

export default config;