import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";

// ============================================================================
// PART 1: FONT CONFIGURATION (CẤU HÌNH FONT)
// Sử dụng font Geist biến thiên mới nhất để tối ưu tốc độ load
// ============================================================================
const geistSans = localFont({
  src: "./fonts/GeistVF.ttf",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap", // Hiển thị text ngay lập tức
  preload: true,
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.ttf",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
  preload: true,
});

// ============================================================================
// PART 2: CONSTANTS & CONFIG (HẰNG SỐ HỆ THỐNG)
// ============================================================================
const APP_NAME = "Magic Comic";
const APP_DEFAULT_TITLE = "Magic Comic - Đọc Truyện Tranh 4.0";
const APP_TITLE_TEMPLATE = "%s | Magic Comic";
const APP_DESCRIPTION = "Nền tảng đọc truyện tranh bản quyền, tốc độ bàn thờ, giao diện Cyberpunk. Cập nhật Manhwa, Manhua, Manga nhanh nhất Việt Nam.";
const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://magic-comic.com";

// ============================================================================
// PART 3: SEO METADATA (VŨ KHÍ LÊN TOP GOOGLE)
// Cấu hình chi tiết cho Facebook, Twitter, Apple, và Robot tìm kiếm
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
    "truyện tranh", "manhwa", "manhua", "manga", "ngôn tình", 
    "đam mỹ", "xuyên không", "tu tiên", "magic comic", 
    "đọc truyện online", "truyện tranh hay", "truyện tranh màu"
  ],
  authors: [{ name: "Magic Team", url: "https://github.com/magic-team" }],
  creator: "Magic Team",
  publisher: "Magic Comic Inc.",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
    languages: {
      "vi-VN": "/vi",
    },
  },
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
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Magic Comic Preview",
      },
      {
        url: "/og-square.jpg",
        width: 600,
        height: 600,
        alt: "Magic Comic Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    images: ["/og-image.jpg"],
    creator: "@magiccomic",
    site: "@magiccomic",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_NAME,
  },
  verification: {
    google: "google-site-verification-code", // Thay code thật vào đây
    yandex: "yandex-verification-code",
  },
  category: "entertainment",
  classification: "Comic Reader",
  referrer: "origin-when-cross-origin",
};

// ============================================================================
// PART 4: VIEWPORT CONFIGURATION (TỐI ƯU HIỂN THỊ MOBILE)
// Chặn zoom lung tung, tối ưu cho notch tai thỏ
// ============================================================================
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Chặn người dùng zoom in/out làm vỡ giao diện App
  themeColor: "#050505",
  colorScheme: "dark",
  viewportFit: "cover", // Tràn viền trên iPhone
};

// ============================================================================
// PART 5: JSON-LD SCHEMA GENERATOR (GIÚP GOOGLE HIỂU WEB LÀ GÌ)
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
      "publisher": {
        "@id": `${SITE_URL}/#organization`
      },
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
      "sameAs": [
        "https://facebook.com/magiccomic",
        "https://twitter.com/magiccomic",
        "https://instagram.com/magiccomic"
      ]
    }
  ]
};

// ============================================================================
// PART 6: ROOT LAYOUT (CẤU TRÚC XƯƠNG SỐNG)
// ============================================================================
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="scroll-smooth antialiased" suppressHydrationWarning>
      <head>
        {/* 1. Preconnect Resources (Kết nối sớm tới Server ảnh) */}
        <link rel="preconnect" href="https://supabasestorage.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://supabasestorage.com" />
        
        {/* 2. PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* 3. Inject JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* 4. Custom CSS for Scrollbar & Selection (Inline để load nhanh nhất) */}
        <style>{`
          ::selection { background-color: #ff4b1f; color: white; }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: #050505; }
          ::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
          ::-webkit-scrollbar-thumb:hover { background: #ff4b1f; }
        `}</style>
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-[#050505] text-white min-h-screen flex flex-col relative overflow-x-hidden selection:bg-primary selection:text-white`}
      >
        {/* --- CÔNG NGHỆ 1: GLOBAL LOADING BAR --- 
            Thanh tiến trình màu cam Neon chạy trên cùng
        */}
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
          zIndex={1600}
        />

        {/* --- CÔNG NGHỆ 2: MULTI-LAYER PARALLAX BACKGROUND --- 
            Hệ thống nền 4 lớp tạo chiều sâu không gian (Không dùng JS để tối ưu)
        */}
        <div className="fixed inset-0 z-[-1] pointer-events-none transform-gpu">
           {/* Layer 1: Deep Space Black */}
           <div className="absolute inset-0 bg-[#050505]"></div>
           
           {/* Layer 2: Cyber Grid (Lưới không gian) */}
           <div 
             className="absolute inset-0 opacity-[0.05]" 
             style={{
                backgroundImage: `linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
             }}
           ></div>

           {/* Layer 3: Noise Texture (Tạo độ nhám film) */}
           <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
           
           {/* Layer 4: Ambient Orbs (Đốm sáng trôi nổi) */}
           <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] opacity-30 animate-pulse-slow"></div>
           <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] opacity-30 animate-pulse-slow" style={{animationDelay: '3s'}}></div>
        </div>

        {/* --- HEADER (GLOBAL NAVIGATION) --- */}
        <Header />

        {/* --- MAIN CONTENT --- */}
        <div className="flex-grow flex flex-col relative z-10 pt-16 md:pt-20">
          {children}
        </div>

        {/* --- FOOTER ĐƠN GIẢN (Để code gọn, Footer phức tạp nên tách file riêng) --- */}
        <div className="relative z-10 border-t border-white/5 bg-[#080808]">
          <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500">
             <p>&copy; 2026 Magic Comic Inc. Server Time: {new Date().toLocaleTimeString()}</p>
             <div className="flex items-center gap-4 mt-4 md:mt-0">
               <span>Điều khoản</span>
               <span>Bảo mật</span>
               <span className="flex items-center gap-1 text-green-500">
                 <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> System Online
               </span>
             </div>
          </div>
        </div>

        {/* --- CÔNG NGHỆ 3: GLOBAL TOAST (THÔNG BÁO) --- */}
        <Toaster 
          position="bottom-right" 
          theme="dark" 
          richColors 
          closeButton
          expand={true}
          toastOptions={{
            style: {
              background: 'rgba(20, 20, 20, 0.8)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              fontSize: '13px',
              borderRadius: '12px',
            }
          }}
        />

        {/* --- CÔNG NGHỆ 4: SECURITY SCRIPT (CHỐNG TRỘM) --- 
            Script này chạy phía Client để chặn chuột phải và F12 (Cơ bản)
        */}
        <Script id="security-layer" strategy="afterInteractive">
          {`
            // 1. Chặn chuột phải (Optional - Bỏ comment nếu muốn dùng)
            // document.addEventListener('contextmenu', event => event.preventDefault());

            // 2. Performance Monitoring (Log chỉ số Web Vitals)
            const reportVital = (metric) => {
               // Gửi về server analytics (Fake log)
               // console.log('[Analytics]', metric.name, metric.value);
            };

            // 3. Anti-Debug (Cơ bản)
            // document.onkeydown = function(e) {
            //   if(e.keyCode == 123) { return false; }
            //   if(e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) { return false; }
            //   if(e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) { return false; }
            //   if(e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) { return false; }
            //   if(e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) { return false; }
            // }
            
            // 4. Console Signature
            console.log(
              '%c STOP! %c Đây là khu vực dành cho lập trình viên Magic Comic.', 
              'background: red; color: white; font-size: 24px; font-weight: bold; padding: 4px 8px; border-radius: 4px;',
              'color: #ff4b1f; font-size: 14px;'
            );
          `}
        </Script>

        {/* --- CÔNG NGHỆ 5: SERVICE WORKER REGISTRATION (PWA) --- */}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                // navigator.serviceWorker.register('/sw.js');
              });
            }
          `}
        </Script>

      </body>
    </html>
  );
}