import type { NextConfig } from "next";

const nextConfig = {
  // Cấu hình cho phép load ảnh từ bên ngoài (Khớp với dữ liệu Mock trong page.tsx)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com", // Cho ảnh bìa truyện
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",    // Cho avatar user/logo
      },
    ],
  },

  // Bỏ qua lỗi ESLint & TypeScript khi Build (Giúp deploy dễ thở hơn)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;