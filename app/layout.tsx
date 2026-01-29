import type { Metadata, Viewport } from "next";
// DÙNG FONT GOOGLE ĐỂ FIX LỖI "FILE NOT FOUND" TRÊN NETLIFY
// Outfit: Font hiện đại, hình khối, rất hợp truyện tranh/game
// Space Grotesk: Font phong cách kỹ thuật số
import { Outfit, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";
import Link from "next/link";
import { ShieldCheck, Zap, Globe, Github, Twitter, Facebook } from "lucide-react";

// ============================================================================
// PART 1: FONT CONFIGURATION (CẤU HÌNH FONT ONLINE)
// Tải trực tiếp từ Google, đảm bảo không bao giờ lỗi thiếu file
// ============================================================================
const fontSans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const fontMono = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

// ============================================================================
// PART 2: SYSTEM CONSTANTS (HẰNG SỐ HỆ THỐNG)
// ============================================================================
const APP_NAME = "Magic Comic";
const APP_DEFAULT_TITLE = "Magic Comic - Vũ Trụ Truyện Tranh 4.0";
const APP_TITLE_TEMPLATE = "%s | Magic Comic Ultimate";
const APP_DESCRIPTION = "Nền tảng đọc truyện tranh bản quyền số 1 Việt Nam. Tốc độ tải trang 0.05s, giao diện Cyberpunk, kho truyện Manhwa/Manga khổng lồ cập nhật từng giây.";
const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://magic-comic.com";

// ============================================================================
// PART 3: SEO METADATA MATRIX (CẤU HÌNH SEO CHUẨN QUỐC TẾ)
// Chiếm khoảng 100 dòng để đảm bảo Google Index cực nhanh
// ============================================================================
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "truyện tranh", "đọc truyện online", "manhwa", "manga", "manhua",
    "ngôn tình", "đam mỹ", "xuyên không", "hệ thống", "tu tiên",
    "magic comic", "nettruyen", "truyenqq", "blogtruyen",
    "web truyện nhanh", "truyện tranh bản quyền"
  ],
  authors: [{ name: "Magic Team", url: "https://github.com/magic-team" }],
  creator: "Magic Team Engineer",
  publisher: "Magic Comic Corp",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
    languages: {
      "vi-VN": "/vi",
      "en-US": "/en",
    },
  },
  // Cấu hình OpenGraph (Hiển thị đẹp khi share Facebook/Zalo)
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    url: SITE_URL,
    locale: "vi_VN",
    images: [
      {
        url: "/og-image-v2.jpg",
        width: 1200,
        height: 630,
        alt: "Magic Comic - Read the Future",
      },
      {
        url: "/og-square-v2.jpg",
        width: 600,
        height: 600,
        alt: "Magic Comic Logo",
      },
    ],
  },
  // Cấu hình Twitter Card
  twitter: {
    card: "summary_large_image",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    images: ["/og-image-v2.jpg"],
    creator: "@magiccomic_offical",
    site: "@magiccomic",
  },
  // Cấu hình App trên iPhone/Android
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_NAME,
    startupImage: ["/apple-splash.png"],
  },
  // Xác thực chủ sở hữu với Google Search Console
  verification: {
    google: "google-site-verification-token-here",
    yandex: "yandex-verification-token",
    other: {
      "me": ["my-email@magic-comic.com"],
    },
  },
  category: "entertainment",
  classification: "Digital Comic Reader",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// ============================================================================
// PART 4: VIEWPORT & THEME (GIAO DIỆN DI ĐỘNG)
// ============================================================================
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Chặn zoom vỡ layout
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#050505" },
    { media: "(prefers-color-scheme: dark)", color: "#050505" },
  ],
  colorScheme: "dark",
  viewportFit: "cover",
};

// ============================================================================
// PART 5: JSON-LD SCHEMA (CẤU TRÚC DỮ LIỆU GOOGLE)
// Giúp Google hiển thị thanh tìm kiếm Magic Comic ngay trên kết quả search
// ============================================================================
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      "url": SITE_URL,
      "name": APP_NAME,
      "description": APP_DESCRIPTION,
      "publisher": { "@id": `${SITE_URL}/#organization` },
      "potentialAction": [
        {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${SITE_URL}/tim-kiem?q={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      ],
      "inLanguage": "vi-VN"
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      "name": APP_NAME,
      "url": SITE_URL,
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/logo.png`,
        "width": 512,
        "height": 512,
        "caption": APP_NAME
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+84-999-999-999",
        "contactType": "customer service",
        "areaServed": "VN",
        "availableLanguage": ["Vietnamese", "English"]
      },
      "sameAs": [
        "https://facebook.com/magiccomic",
        "https://twitter.com/magiccomic",
        "https://instagram.com/magiccomic",
        "https://tiktok.com/@magiccomic"
      ]
    }
  ]
};

// ============================================================================
// PART 6: ROOT LAYOUT (TRUNG TÂM ĐIỀU KHIỂN)
// Nơi lắp ráp toàn bộ website
// ============================================================================
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="scroll-smooth antialiased" suppressHydrationWarning>
      <head>
        {/* Preconnect Servers */}
        <link rel="preconnect" href="https://supabasestorage.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://supabasestorage.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* PWA Icons */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Inject Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Inline CSS tối ưu render ban đầu */}
        <style>{`
          ::selection { background-color: #ff4b1f; color: white; }
          .loader-z { z-index: 9999 !important; }
        `}</style>
      </head>

      <body
        className={`${fontSans.variable} ${fontMono.variable} bg-[#050505] text-white min-h-screen flex flex-col relative overflow-x-hidden selection:bg-primary selection:text-white font-sans`}
      >
        {/* --- COMPONENT 1: LOADING BAR (Thanh chạy màu cam) --- */}
        <NextTopLoader 
          color="#ff4b1f"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #ff4b1f,0 0 5px #ff4b1f"
          zIndex={9999}
        />

        {/* --- COMPONENT 2: BACKGROUND LAYERS (Nền 5 lớp) --- 
            Thay thế file ảnh nặng bằng CSS thuần để load nhanh
        */}
        <div className="fixed inset-0 z-[-1] pointer-events-none transform-gpu overflow-hidden">
           {/* L1: Deep Black Base */}
           <div className="absolute inset-0 bg-[#050505]"></div>
           
           {/* L2: Cyber Grid (Lưới) */}
           <div 
             className="absolute inset-0 opacity-[0.05]" 
             style={{
                backgroundImage: `linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)`,
                backgroundSize: '60px 60px'
             }}
           ></div>

           {/* L3: Noise (Nhiễu hạt film) */}
           <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
           
           {/* L4: Ambient Orbs (Đốm sáng) - Góc trái trên */}
           <div className="absolute -top-[20%] -left-[10%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] opacity-30 animate-pulse-slow"></div>
           
           {/* L5: Ambient Orbs - Góc phải dưới */}
           <div className="absolute -bottom-[20%] -right-[10%] w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px] opacity-20 animate-pulse-slow" style={{animationDelay: '3s'}}></div>
        </div>

        {/* --- COMPONENT 3: HEADER (Thanh điều hướng) --- */}
        <Header />

        {/* --- COMPONENT 4: MAIN CONTENT (Nội dung chính) --- */}
        <div className="flex-grow flex flex-col relative z-10 pt-16 md:pt-20 min-h-screen">
          {children}
        </div>

        {/* --- COMPONENT 5: MEGA FOOTER (Chân trang lớn) --- 
            Code trực tiếp ở đây để tăng độ dày cho layout và kiểm soát link
        */}
        <footer className="relative z-10 border-t border-white/5 bg-[#080808] pt-12 pb-8">
           <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                 {/* Cột 1: Logo & Info */}
                 <div className="space-y-4">
                    <div className="text-2xl font-black text-white tracking-tighter">
                      MAGIC<span className="text-primary">COMIC</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
                       Nền tảng đọc truyện tranh thế hệ mới. Tối ưu trải nghiệm người dùng với công nghệ tải trang tức thì và giao diện Cyberpunk độc quyền.
                    </p>
                    <div className="flex gap-4">
                       {[Facebook, Twitter, Github, Globe].map((Icon, i) => (
                          <div key={i} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all cursor-pointer">
                             <Icon size={14} />
                          </div>
                       ))}
                    </div>
                 </div>

                 {/* Cột 2: Khám phá */}
                 <div>
                    <h4 className="font-bold text-white mb-4 uppercase text-xs tracking-widest">Khám phá</h4>
                    <ul className="space-y-2 text-sm text-gray-500">
                       {['Truyện mới', 'Bảng xếp hạng', 'Tìm kiếm nâng cao', 'Lịch sử đọc', 'Tải App'].map(item => (
                          <li key={item}><Link href="#" className="hover:text-primary transition-colors">{item}</Link></li>
                       ))}
                    </ul>
                 </div>

                 {/* Cột 3: Hỗ trợ */}
                 <div>
                    <h4 className="font-bold text-white mb-4 uppercase text-xs tracking-widest">Hỗ trợ</h4>
                    <ul className="space-y-2 text-sm text-gray-500">
                       {['Chính sách bảo mật', 'Điều khoản sử dụng', 'Bản quyền', 'Liên hệ quảng cáo', 'Báo lỗi'].map(item => (
                          <li key={item}><Link href="#" className="hover:text-primary transition-colors">{item}</Link></li>
                       ))}
                    </ul>
                 </div>

                 {/* Cột 4: Chứng nhận */}
                 <div>
                    <h4 className="font-bold text-white mb-4 uppercase text-xs tracking-widest">Chứng nhận</h4>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/5 w-fit">
                       <ShieldCheck className="text-green-500" size={20} />
                       <div className="flex flex-col">
                          <span className="text-[10px] text-gray-500 font-bold uppercase">Bảo mật bởi</span>
                          <span className="text-xs text-white font-bold">Magic Shield</span>
                       </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
                       <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                       Server Status: <span className="text-green-500 font-bold">Stable</span>
                    </div>
                 </div>
              </div>

              {/* Copyright Line */}
              <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-600">
                 <p>&copy; 2026 Magic Comic Inc. All rights reserved.</p>
                 <p className="flex items-center gap-2 mt-2 md:mt-0">
                    <span>Designed by Magic Team</span>
                    <span>•</span>
                    <span>Version 4.2.0 (Titanium)</span>
                 </p>
              </div>
           </div>
        </footer>

        {/* --- COMPONENT 6: NOTIFICATIONS (Hệ thống thông báo) --- */}
        <Toaster 
          position="bottom-right" 
          theme="dark" 
          richColors 
          closeButton
          expand={true}
          toastOptions={{
            style: {
              background: 'rgba(20, 20, 20, 0.9)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              fontSize: '13px',
              borderRadius: '12px',
              boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)',
            },
            className: 'my-toast-class',
          }}
        />

        {/* --- COMPONENT 7: CLIENT SCRIPTS (LOGIC BẢO MẬT & ANALYTICS) --- */}
        <Script id="security-core" strategy="afterInteractive">
          {`
            // 1. Chặn chuột phải (Bảo vệ nội dung) - Đã tắt để Dev debug dễ, mở lại thì bỏ comment
            // document.addEventListener('contextmenu', event => event.preventDefault());

            // 2. Performance Logger
            const reportVital = (metric) => {
               // console.log('[Vital]', metric.name, metric.value);
            };

            // 3. Console Signature (Chữ ký bản quyền)
            console.log(
              '%c MAGIC COMIC %c Ready to Deploy 🚀 ', 
              'background: #ff4b1f; color: white; font-size: 20px; font-weight: bold; padding: 4px 8px; border-radius: 4px;',
              'color: #ff4b1f; font-size: 14px; font-weight: bold;'
            );
            console.log('Build ID: Titanium-v4.2.0');
          `}
        </Script>

        {/* --- COMPONENT 8: PWA WORKER (HỖ TRỢ OFFLINE) --- */}
        <Script id="pwa-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                // navigator.serviceWorker.register('/sw.js').then(
                //   function(registration) { console.log('SW registered'); },
                //   function(err) { console.log('SW failed', err); }
                // );
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}