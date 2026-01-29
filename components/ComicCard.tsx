'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Comic } from '@/types';
import { Play, Zap, Clock, Eye, Layers } from 'lucide-react';

// --- CẤU HÌNH ---
// Tỉ lệ khung hình chuẩn cho truyện tranh (3:4 hoặc 2:3 tùy gu)
const ASPECT_RATIO = 'aspect-[3/4]';

export default function ComicCard({ comic }: { comic: Comic }) {
  // Giả lập dữ liệu bổ sung (Nếu DB chưa có) để card nhìn "nguy hiểm" hơn
  // Trong thực tế, bạn nên query các trường này từ DB
  const viewCount = comic.views || Math.floor(Math.random() * 900000) + 10000;
  const chapterCount = Math.floor(Math.random() * 500) + 20;
  const isHot = viewCount > 500000;
  // Giả lập tags, lấy 2 tag đầu tiên
  const displayTags = comic.tags?.slice(0, 2) || ['Manhwa', 'Action']; 

  // Hàm format số view (VD: 1.2M, 850K)
  const formatViews = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toString();
  };

  return (
    <Link 
      href={`/truyen/${comic.slug}`} 
      className="group relative flex flex-col w-full h-full select-none perspective-1000"
      aria-label={`Đọc truyện ${comic.title}`}
    >
      {/* --- CÔNG NGHỆ 1: CONTAINER TỐI ƯU GPU ---
        - will-change-transform: Báo trước cho trình duyệt biết sắp có chuyển động để tối ưu.
        - backface-hidden: Ẩn mặt sau khi xoay 3D, giúp render mượt hơn.
        - transform-gpu: Ép sử dụng GPU.
      */}
      <div 
        className="relative w-full flex-1 rounded-2xl overflow-hidden bg-[#121212] border border-white/5 transition-all duration-500 ease-out-expo group-hover:border-primary/50 group-hover:shadow-neon-hover group-hover:-translate-y-2 will-change-transform transform-gpu backface-hidden"
      >
        
        {/* --- CÔNG NGHỆ 2: ẢNH TỐI ƯU CLS (Cumulative Layout Shift) --- */}
        <div className={`relative w-full ${ASPECT_RATIO} bg-[#1a1a1a] overflow-hidden`}>
          <Image
            src={comic.thumbnail}
            alt={comic.title}
            fill
            // sizes cực quan trọng: Giúp Next.js tải ảnh nhỏ cho mobile, ảnh to cho PC
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 group-hover:rotate-1"
            loading="lazy"
            // Placeholder mờ trong khi chờ tải thật
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P//fwAJiANytd8C2wAAAABJRU5ErkJggg=="
          />
          
          {/* Lớp phủ Noise (Nhiễu hạt) tạo texture cao cấp */}
          <div className="absolute inset-0 opacity-[0.15] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none"></div>
          
          {/* Gradient Overlay: Giúp chữ trắng bên dưới luôn dễ đọc */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/30 opacity-80" />

          {/* --- CÔNG NGHỆ 3: BACKDROP FILTER BADGES (NHÃN KÍNH MỜ) --- */}
          {/* Badge HOT / NEW ở góc trên trái */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 items-start">
             {isHot && (
               <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-600/80 backdrop-blur-md border border-red-400/30 rounded-lg text-[10px] font-black text-white uppercase tracking-wider shadow-lg animate-pulse-slow">
                 <Zap size={12} className="fill-white" /> HOT 🔥
               </span>
             )}
          </div>

          {/* Badge Số chương ở góc trên phải */}
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-lg text-[10px] font-bold text-gray-200">
              <Layers size={12} /> {chapterCount} Chap
            </span>
          </div>

          {/* --- HOVER INTERACTION LAYER (LỚP TƯƠNG TÁC KHI DI CHUỘT) --- */}
          {/* Nút Play chính giữa */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-10 backdrop-blur-[2px]">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-orange-500 flex items-center justify-center shadow-[0_0_30px_rgba(var(--primary),0.6)] transform scale-50 group-hover:scale-100 transition-transform duration-[400ms] cubic-bezier(0.34, 1.56, 0.64, 1)">
              <Play className="fill-white text-white ml-1" size={24} />
            </div>
          </div>
          
          {/* Quick Stats Overlay (Hiện ở đáy ảnh khi hover) */}
          <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
             <div className="flex items-center justify-between text-xs font-medium text-gray-300">
                <span className="flex items-center gap-1"><Eye size={14} className="text-primary" /> {formatViews(viewCount)}</span>
                <span className="flex items-center gap-1"><Clock size={14} /> 2 giờ trước</span>
             </div>
          </div>
        </div>
      </div>

      {/* --- INFO SECTION (PHẦN THÔNG TIN BÊN DƯỚI) --- */}
      <div className="mt-3 px-1 space-y-2 relative z-20">
        {/* Tags Pills */}
        <div className="flex flex-wrap gap-1.5 h-5 overflow-hidden">
          {displayTags.map((tag, index) => (
            <span key={index} className="px-1.5 py-[2px] rounded-[4px] text-[9px] font-bold uppercase tracking-wider bg-white/5 text-gray-400 border border-white/10 group-hover:border-primary/30 group-hover:text-primary/80 transition-colors">
              {tag}
            </span>
          ))}
        </div>

        {/* Title with Text Glow effect on hover */}
        <h3 className="text-[15px] font-bold leading-tight text-white line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-orange-400 transition-all duration-300">
          {comic.title}
        </h3>
        
        {/* Author & Status */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 truncate max-w-[60%] group-hover:text-gray-400 transition-colors">
            {comic.author || 'Đang cập nhật'}
          </span>
          {/* Status indicator dot */}
          <div className="flex items-center gap-1.5">
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
             </span>
             <span className="text-[10px] font-bold text-green-500">Đang tiến hành</span>
          </div>
        </div>
      </div>
      
    </Link>
  );
}