'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowLeft, ArrowRight, Home, Settings, 
  ChevronRight, Menu, Sun, Moon, 
  Maximize, Minimize, List 
} from 'lucide-react';
import ChapterImage from './ChapterImage';

// --- TYPES ĐỊNH NGHĨA CHO CHUẨN TYPESCRIPT ---
interface ReaderClientProps {
  chapter: any;
  prevChapter: any;
  nextChapter: any;
  comicSlug: string;
}

export default function ReaderClient({ 
  chapter, 
  prevChapter, 
  nextChapter, 
  comicSlug 
}: ReaderClientProps) {
  
  // --- 1. STATE MANAGEMENT (QUẢN LÝ TRẠNG THÁI) ---
  const [showMenu, setShowMenu] = useState(true); // Ẩn hiện menu
  const [brightness, setBrightness] = useState(100); // Độ sáng màn hình
  const [zoomLevel, setZoomLevel] = useState(800); // Độ rộng ảnh (Zoom)
  const [scrollProgress, setScrollProgress] = useState(0); // Thanh tiến trình đọc
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Menu cài đặt
  
  // Ref để xử lý cuộn trang
  const lastScrollY = useRef(0);
  const touchStartY = useRef(0);

  // --- 2. XỬ LÝ SỰ KIỆN (EVENT HANDLERS) ---

  // Tự động ẩn menu khi cuộn xuống, hiện khi cuộn lên
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    
    // Tính phần trăm đọc để hiển thị thanh Progress
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (currentScrollY / totalHeight) * 100;
    setScrollProgress(progress);

    // Logic ẩn hiện menu thông minh
    if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
      setShowMenu(false); // Cuộn xuống -> Ẩn
      setIsSettingsOpen(false); // Đóng luôn setting nếu đang mở
    } else {
      setShowMenu(true); // Cuộn lên -> Hiện
    }
    lastScrollY.current = currentScrollY;
  }, []);

  // Bắt sự kiện phím tắt (Mũi tên trái/phải để chuyển chương)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && prevChapter) {
        window.location.href = `/truyen/${comicSlug}/${prevChapter.slug}`;
      }
      if (e.key === 'ArrowRight' && nextChapter) {
        window.location.href = `/truyen/${comicSlug}/${nextChapter.slug}`;
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleScroll, prevChapter, nextChapter, comicSlug]);

  // --- 3. CÁC HÀM TIỆN ÍCH ---

  // Cuộn lên đầu trang
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- 4. GIAO DIỆN (RENDER) ---
  return (
    <div className="min-h-screen bg-[#050505] relative transition-colors duration-300">
      
      {/* Lớp phủ chỉnh độ sáng (Brightness Overlay) */}
      <div 
        className="fixed inset-0 z-40 pointer-events-none mix-blend-multiply bg-black transition-opacity duration-300"
        style={{ opacity: (100 - brightness) / 100 }}
      />

      {/* --- THANH TIẾN TRÌNH (READING PROGRESS BAR) --- */}
      <div className="fixed top-0 inset-x-0 h-1 z-[60] bg-gray-800">
        <div 
          className="h-full bg-gradient-to-r from-primary via-orange-400 to-yellow-500 shadow-[0_0_10px_rgba(var(--primary),0.8)] transition-all duration-100 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* --- HEADER (DYNAMIC ISLAND STYLE) --- */}
      <header 
        className={`fixed top-4 inset-x-4 h-16 z-50 transition-all duration-500 transform ${
          showMenu ? 'translate-y-0 opacity-100' : '-translate-y-24 opacity-0'
        }`}
      >
        <div className="panel-glass rounded-2xl h-full flex items-center justify-between px-3 shadow-glass">
          {/* Nút Back */}
          <Link href={`/truyen/${comicSlug}`} className="btn-tech-ghost !p-2 !rounded-xl !border-0 text-gray-400 hover:text-white">
            <ArrowLeft size={24} />
          </Link>

          {/* Tiêu đề chương */}
          <div className="flex flex-col items-center cursor-pointer" onClick={scrollToTop}>
            <span className="text-[10px] text-primary font-black uppercase tracking-[0.2em] animate-pulse">
              READING MODE
            </span>
            <h1 className="text-sm font-bold text-white truncate max-w-[150px] md:max-w-md">
              {chapter.title}
            </h1>
          </div>

          {/* Menu Cài đặt */}
          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`btn-tech-ghost !p-2 !rounded-xl !border-0 transition-all ${isSettingsOpen ? 'text-primary bg-white/10' : 'text-gray-400 hover:text-white'}`}
          >
            <Settings size={24} className={isSettingsOpen ? 'animate-spin-slow' : ''} />
          </button>
        </div>
      </header>

      {/* --- MENU CÀI ĐẶT (SETTINGS PANEL) --- */}
      <div 
        className={`fixed top-24 right-4 z-50 w-64 panel-glass rounded-2xl p-4 transition-all duration-300 transform origin-top-right ${
          showMenu && isSettingsOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        }`}
      >
        <div className="space-y-4">
          {/* Chỉnh Độ sáng */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase">
              <span>Độ sáng</span>
              <span>{brightness}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Moon size={16} className="text-gray-500" />
              <input 
                type="range" min="30" max="100" 
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <Sun size={16} className="text-yellow-500" />
            </div>
          </div>

          <hr className="border-white/10" />

          {/* Chỉnh Khổ ảnh (Zoom) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase">
              <span>Khổ ảnh</span>
              <span>{Math.round(zoomLevel / 8)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Minimize size={16} className="text-gray-500" />
              <input 
                type="range" min="400" max="1200" step="50"
                value={zoomLevel}
                onChange={(e) => setZoomLevel(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <Maximize size={16} className="text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* --- NỘI DUNG ẢNH (MAIN CONTENT) --- */}
      {/* Tap vào giữa màn hình để bật/tắt menu */}
      <main 
        className="pt-0 pb-40 min-h-screen cursor-pointer"
        onClick={() => { setShowMenu(!showMenu); setIsSettingsOpen(false); }}
      >
        <div 
          className="mx-auto transition-all duration-300 ease-out space-y-[2px]"
          style={{ maxWidth: `${zoomLevel}px` }}
        >
          {chapter.images?.map((img: string, idx: number) => (
            <div key={idx} className="relative w-full shadow-2xl bg-gray-900">
               <ChapterImage src={img} alt={`Trang ${idx + 1} - ${chapter.title}`} />
               
               {/* Số trang hiện mờ ở góc */}
               <span className="absolute bottom-2 right-2 text-[10px] font-mono text-white/30 bg-black/50 px-1 rounded">
                 {idx + 1}
               </span>
            </div>
          ))}
        </div>
      </main>

      {/* --- THANH ĐIỀU KHIỂN DƯỚI (BOTTOM CONTROL) --- */}
      <footer 
        className={`fixed bottom-0 inset-x-0 z-50 transition-transform duration-500 ${
          showMenu ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Nền Gradient mờ làm background cho nút */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/95 to-transparent pointer-events-none" />

        <div className="relative w-full max-w-2xl mx-auto p-4 flex items-stretch gap-3">
          
          {/* NÚT TRƯỚC */}
          <Link
            href={prevChapter ? `/truyen/${comicSlug}/${prevChapter.slug}` : '#'}
            className={`flex-1 btn-tech-ghost backdrop-blur-md !bg-white/5 hover:!bg-white/10 ${
              !prevChapter && 'opacity-30 pointer-events-none grayscale'
            }`}
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline font-bold">Trước</span>
          </Link>

          {/* NÚT DANH SÁCH CHƯƠNG (Nút giữa) */}
          <Link
            href={`/truyen/${comicSlug}`}
            className="flex items-center justify-center px-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 text-gray-300 transition-all"
          >
            <List size={24} />
          </Link>

          {/* NÚT TIẾP THEO (NÚT THẦN THÁNH) */}
          <Link
            href={nextChapter ? `/truyen/${comicSlug}/${nextChapter.slug}` : '#'}
            className={`flex-[2] group btn-tech-primary shadow-neon overflow-hidden relative ${
              !nextChapter && 'opacity-50 pointer-events-none bg-gray-800 !shadow-none'
            }`}
          >
            {/* Hiệu ứng quét sáng shimmer chạy liên tục */}
            <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1s_infinite]" />
            
            <span className="relative z-10 flex items-center gap-2 text-lg">
              TIẾP THEO <ChevronRight size={24} className="animate-pulse" />
            </span>
          </Link>
          
        </div>
      </footer>
    </div>
  );
}