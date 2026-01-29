'use client'; // Bắt buộc dòng này vì có dùng useState (client component)

import { useState } from 'react';
import Image from 'next/image';

export default function ChapterImage({ src, alt }: { src: string; alt: string }) {
  // Biến trạng thái: Mặc định là đang tải (true)
  const [isLoading, setIsLoading] = useState(true);

  return (
    // min-h-[500px]: Giữ sẵn chiều cao 500px để màn hình không bị nhảy lung tung khi ảnh chưa về
    <div className="relative w-full min-h-[500px] bg-[#1a1a1a] mb-1">
      
      {/* 1. KHUNG XÁM SKELETON (Chỉ hiện khi đang tải) */}
      {isLoading && (
        <div className="absolute inset-0 skeleton flex items-center justify-center z-10">
          <span className="text-gray-500 text-xs animate-pulse">Đang tải ảnh...</span>
        </div>
      )}

      {/* 2. ẢNH THẬT */}
      <Image
        src={src}
        alt={alt}
        width={800} // Chiều rộng chuẩn
        height={1200} // Chiều cao ước lượng
        quality={75} // Giảm chất lượng xuống 75% để load nhanh hơn trên 3G
        className={`w-full h-auto object-contain transition-opacity duration-500 ${
          isLoading ? 'opacity-0' : 'opacity-100' // Nếu đang tải thì ẩn (opacity 0), xong thì hiện (opacity 100)
        }`}
        onLoadingComplete={() => setIsLoading(false)} // Khi ảnh tải xong -> Tắt trạng thái Loading
        loading="lazy" // Tải lười (lướt tới đâu tải tới đó)
      />
    </div>
  );
}