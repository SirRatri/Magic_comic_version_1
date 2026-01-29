import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google"; // Dùng font Google chuẩn, load siêu nhanh
import NextTopLoader from 'nextjs-toploader'; // Thanh loading trên đầu
import { Toaster } from 'sonner'; // Thông báo
import Header from '@/components/Header';
import "./globals.css";

// Tối ưu Font chữ: Chỉ tải các ký tự Latin và tiếng Việt để nhẹ máy
const inter = Inter({ 
  subsets: ["latin", "vietnamese"],
  display: "swap", // Hiển thị text ngay lập tức, không chờ load font xong
});

// Cấu hình SEO & Metadata chuẩn chỉ
export const metadata: Metadata = {
  title: {
    template: '%s | Magic Comic', // VD: Naruto | Magic Comic
    default: 'Magic Comic - Đọc Truyện Tranh Online',
  },
  description: "Web đọc truyện tranh tối ưu cho máy yếu, tải siêu nhanh, không quảng cáo.",
  openGraph: {
    title: 'Magic Comic',
    description: 'Đọc truyện mượt mà trên mọi thiết bị.',
    siteName: 'Magic Comic',
    type: 'website',
  },
};

// Cấu hình Viewport (Quan trọng cho Mobile): Chặn zoom lung tung
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Chặn người dùng zoom in/out làm vỡ giao diện
  themeColor: '#121212',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.className} antialiased min-h-screen bg-[#121212] text-gray-200`}>
        {/* 1. THANH LOADING CHẠY TRÊN ĐẦU (UX Cực quan trọng cho mạng lag) */}
        <NextTopLoader 
          color="#ff4b1f" // Màu cam chủ đạo
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false} // Tắt cái vòng xoay xoay ở chuột, chỉ để thanh ngang cho sang
          shadow="0 0 10px #ff4b1f,0 0 5px #ff4b1f"
        />

        {/* 2. HEADER CỐ ĐỊNH (Không load lại khi chuyển trang) */}
        <Header />

        {/* 3. NỘI DUNG CHÍNH (Đẩy xuống 80px để không bị Header che mất) */}
        <main className="pt-20 pb-10 px-4 min-h-screen">
          {children}
        </main>

        {/* 4. FOOTER ĐƠN GIẢN */}
        <footer className="border-t border-gray-800 py-8 text-center text-xs text-gray-600">
          <p>© 2024 Magic Comic. Designed for Performance.</p>
        </footer>

        {/* 5. KHUNG THÔNG BÁO (Để sau này hiện: "Đã lưu truyện", "Lỗi mạng"...) */}
        <Toaster position="bottom-center" theme="dark" />
      </body>
    </html>
  );
}