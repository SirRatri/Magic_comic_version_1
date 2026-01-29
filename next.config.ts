import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'supabaselinkcuaban.supabase.co', // Nhớ thay link supabase của bạn vào đây nếu chưa thay
      }
    ],
  },
};

export default nextConfig;