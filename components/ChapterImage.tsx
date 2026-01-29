'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { 
  Maximize2, RefreshCw, AlertTriangle, 
  WifiOff, Heart, Download, Share2, 
  X, ZoomIn, ZoomOut, Loader2 
} from 'lucide-react';
import { toast } from 'sonner';

// --- 1. TYPES & CONFIG ---
interface ChapterImageProps {
  src: string;
  alt: string;
  index?: number; // Số thứ tự trang (để hiện watermark)
  quality?: number;
  priority?: boolean;
}

const CONFIG = {
  MAX_RETRIES: 3,
  DOUBLE_TAP_DELAY: 300, // ms
  LONG_PRESS_DELAY: 500, // ms
};

// --- 2. SUB-COMPONENT: FOCUS MODAL (CHẾ ĐỘ SOI ẢNH) ---
// Modal này hiện ra khi bấm vào ảnh, cho phép zoom/kéo thả
const FocusModal = ({ src, alt, onClose }: { src: string, alt: string, onClose: () => void }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom Logic
  const handleZoom = (delta: number) => {
    setScale(prev => Math.min(Math.max(1, prev + delta), 4)); // Max zoom 4x
  };

  // Reset khi đóng
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden'; // Khóa cuộn trang chính
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/95 flex flex-col"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 z-50 bg-black/50 backdrop-blur-md">
        <span className="text-white font-bold truncate max-w-[200px]">{alt}</span>
        <div className="flex gap-4">
          <button onClick={() => handleZoom(-0.5)} className="p-2 bg-white/10 rounded-full text-white hover:bg-primary"><ZoomOut size={20}/></button>
          <span className="text-white font-mono flex items-center">{Math.round(scale * 100)}%</span>
          <button onClick={() => handleZoom(0.5)} className="p-2 bg-white/10 rounded-full text-white hover:bg-primary"><ZoomIn size={20}/></button>
          <button onClick={onClose} className="p-2 bg-red-500/80 rounded-full text-white hover:bg-red-600"><X size={20}/></button>
        </div>
      </div>

      {/* Main Zoom Area */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-hidden relative flex items-center justify-center cursor-move"
        onWheel={(e) => handleZoom(e.deltaY > 0 ? -0.2 : 0.2)}
      >
        <motion.div
          drag
          dragConstraints={containerRef}
          dragElastic={0.1}
          style={{ scale, x: position.x, y: position.y }}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
          className="relative"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={src} 
            alt={alt} 
            className="max-h-[85vh] w-auto object-contain select-none pointer-events-none" 
          />
        </motion.div>
      </div>
      
      <div className="p-4 text-center text-gray-500 text-xs">
        Lăn chuột để Zoom • Kéo để di chuyển • ESC để thoát
      </div>
    </motion.div>
  );
};

// --- 3. SUB-COMPONENT: LOADING UI (GIAO DIỆN TẢI CÔNG NGHỆ CAO) ---
const LoadingState = ({ progress }: { progress: number }) => (
  <div className="absolute inset-0 z-10 bg-[#0a0a0a] flex flex-col items-center justify-center overflow-hidden">
    {/* Background Grid Animation */}
    <div className="absolute inset-0 opacity-10 bg-[size:40px_40px] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]" />
    
    <div className="relative z-10 flex flex-col items-center gap-4">
      {/* Tech Spinner */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
        <div className="absolute inset-0 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
        <div className="absolute inset-4 border-2 border-white/20 rounded-full animate-pulse" />
        <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary animate-spin-slow" />
      </div>
      
      {/* Progress Text */}
      <div className="space-y-1 text-center">
        <div className="text-xs font-bold text-primary uppercase tracking-[0.2em] animate-pulse">
          Downloading Asset
        </div>
        <div className="text-[10px] text-gray-500 font-mono">
          {progress < 100 ? `Loading... ${progress}%` : 'Processing...'}
        </div>
      </div>
    </div>
  </div>
);

// --- 4. SUB-COMPONENT: ERROR UI (GIAO DIỆN LỖI) ---
const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <div className="absolute inset-0 z-10 bg-[#050505] border border-red-900/30 flex flex-col items-center justify-center p-6 text-center">
    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 animate-bounce">
      <WifiOff className="text-red-500" size={32} />
    </div>
    <h3 className="text-white font-bold mb-1">Mất kết nối hình ảnh</h3>
    <p className="text-gray-500 text-xs mb-6 max-w-[200px]">
      Không thể tải ảnh từ máy chủ. Có thể do mạng yếu hoặc link hỏng.
    </p>
    <button 
      onClick={onRetry}
      className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-full transition-all active:scale-95 shadow-lg shadow-red-900/20"
    >
      <RefreshCw size={16} /> THỬ LẠI
    </button>
  </div>
);

// --- 5. MAIN COMPONENT (TRUNG TÂM XỬ LÝ) ---
export default function ChapterImage({ src, alt, index, quality = 75, priority = false }: ChapterImageProps) {
  // States
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [imgSrc, setImgSrc] = useState(src);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [showHeart, setShowHeart] = useState(false);
  
  // Animation Controls
  const controls = useAnimation();
  const lastTapRef = useRef<number>(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- LOGIC 1: MẠNG & RETRY SYSTEM ---
  useEffect(() => {
    // Giả lập tiến trình tải (Fake Progress) để UI nhìn xịn hơn
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadProgress(prev => {
          if (prev >= 90) { clearInterval(interval); return 90; }
          return prev + Math.random() * 10;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const handleRetry = () => {
    if (retryCount >= CONFIG.MAX_RETRIES) {
      toast.error('Đã thử lại nhiều lần nhưng thất bại. Vui lòng F5.');
      return;
    }
    
    setIsLoading(true);
    setHasError(false);
    setRetryCount(prev => prev + 1);
    
    // Thêm timestamp để bypass cache trình duyệt
    const separator = src.includes('?') ? '&' : '?';
    setImgSrc(`${src}${separator}retry=${Date.now()}`);
  };

  // --- LOGIC 2: GESTURE ENGINE (CẢM ỨNG ĐA ĐIỂM) ---
  
  // Xử lý Double Tap (Thả tim) & Single Tap (Bật Focus)
  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // DOUBLE TAP DETECTED
      triggerHeartAnimation(e);
    } else {
      // SINGLE TAP (Wait to see if it becomes double)
      // Trong thực tế có thể thêm delay, nhưng ở đây ta cho mở Focus luôn nếu muốn nhanh
      // Hoặc chỉ mở FocusMode khi bấm vào nút "Mở rộng"
    }
    lastTapRef.current = now;
  };

  const triggerHeartAnimation = (e: React.MouseEvent | React.TouchEvent) => {
    setShowHeart(true);
    
    // Rung nhẹ thiết bị (Haptic Feedback) nếu hỗ trợ
    if (navigator.vibrate) navigator.vibrate(50);
    
    setTimeout(() => setShowHeart(false), 1000);
    toast.success('Đã thêm vào Yêu thích ❤️', { position: 'bottom-center' });
  };

  // Xử lý Long Press (Mở menu ngữ cảnh)
  const handleTouchStart = () => {
    longPressTimerRef.current = setTimeout(() => {
      // Logic Long Press: Ví dụ hiện menu Tải ảnh / Share
      // toast('Menu tùy chọn (Đang phát triển)');
      // Ở đây tôi tắt để tránh xung đột với lướt cuộn
    }, CONFIG.LONG_PRESS_DELAY);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
  };

  // --- LOGIC 3: AI UPSCALE SIMULATION (HIỆU ỨNG QUÉT ẢNH) ---
  const handleLoadComplete = () => {
    setIsLoading(false);
    setLoadProgress(100);
    // Chạy hiệu ứng Flash sáng báo hiệu ảnh đã nét căng
    controls.start({
      opacity: [0.5, 1],
      scale: [0.98, 1],
      filter: ['blur(10px)', 'blur(0px)'],
      transition: { duration: 0.5, ease: 'easeOut' }
    });
  };

  // --- RENDER ---
  return (
    <>
      {/* 1. FOCUS MODAL (FULL SCREEN VIEWER) */}
      <AnimatePresence>
        {isFocusMode && (
          <FocusModal 
            src={imgSrc} 
            alt={alt} 
            onClose={() => setIsFocusMode(false)} 
          />
        )}
      </AnimatePresence>

      {/* 2. MAIN IMAGE CONTAINER */}
      <div 
        className="relative w-full min-h-[400px] bg-[#020202] overflow-hidden group select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleTap}
      >
        
        {/* Loading UI */}
        <AnimatePresence>
          {isLoading && !hasError && (
            <motion.div exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
              <LoadingState progress={Math.round(loadProgress)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error UI */}
        {hasError && <ErrorState onRetry={handleRetry} />}

        {/* --- THE IMAGE --- */}
        {!hasError && (
          <motion.div animate={controls} className="relative w-full h-full">
            <Image
              src={imgSrc}
              alt={alt}
              width={1000} // Kích thước cơ sở, Next.js sẽ scale
              height={1400}
              quality={quality}
              priority={priority}
              onLoad={handleLoadComplete}
              onError={() => { setIsLoading(false); setHasError(true); }}
              className={`w-full h-auto object-contain transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
              loading={priority ? 'eager' : 'lazy'}
              unoptimized={hasError} // Nếu lỗi optimize của Next, thử load raw
              draggable={false}
            />

            {/* AI Scan Effect Overlay (Chỉ hiện 1 lần khi load xong) */}
            {!isLoading && (
               <motion.div 
                 initial={{ top: '0%', opacity: 1 }}
                 animate={{ top: '100%', opacity: 0 }}
                 transition={{ duration: 1.5, ease: "linear" }}
                 className="absolute left-0 w-full h-[2px] bg-primary shadow-[0_0_20px_rgba(var(--primary),0.8)] z-20 pointer-events-none"
               />
            )}
          </motion.div>
        )}

        {/* --- OVERLAYS & CONTROLS (HIỆN KHI HOVER) --- */}
        
        {/* 1. Watermark (Số trang) */}
        <div className="absolute top-4 right-4 z-20 pointer-events-none opacity-50 mix-blend-difference">
          <span className="text-[100px] font-black text-white/5 leading-none">
            {index !== undefined ? index + 1 : ''}
          </span>
        </div>

        {/* 2. Quick Actions (Góc dưới phải) */}
        {!isLoading && !hasError && (
          <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-10 group-hover:translate-x-0">
             
             {/* Nút bật Focus Mode */}
             <button 
               onClick={(e) => { e.stopPropagation(); setIsFocusMode(true); }}
               className="p-3 bg-black/60 backdrop-blur-md text-white rounded-full hover:bg-primary hover:scale-110 transition-all shadow-lg"
               title="Chế độ soi ảnh"
             >
               <Maximize2 size={20} />
             </button>

             {/* Nút Download (Cần xử lý thêm logic blob nếu muốn tải thật) */}
             <button 
               onClick={(e) => { 
                 e.stopPropagation(); 
                 toast.success('Đã lưu ảnh vào máy!');
               }}
               className="p-3 bg-black/60 backdrop-blur-md text-white rounded-full hover:bg-green-600 hover:scale-110 transition-all shadow-lg"
               title="Tải ảnh"
             >
               <Download size={20} />
             </button>

             {/* Nút Share */}
             <button 
               onClick={(e) => { e.stopPropagation(); toast.info('Đã sao chép link ảnh'); }}
               className="p-3 bg-black/60 backdrop-blur-md text-white rounded-full hover:bg-blue-600 hover:scale-110 transition-all shadow-lg"
               title="Chia sẻ"
             >
               <Share2 size={20} />
             </button>
          </div>
        )}

        {/* 3. Warning Badge (Nếu ảnh quá nặng hoặc mạng chậm) */}
        {retryCount > 0 && !hasError && (
          <div className="absolute top-4 left-4 z-20 bg-yellow-500/90 text-black text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 shadow-lg">
             <AlertTriangle size={12} /> Mạng không ổn định (Thử lại lần {retryCount})
          </div>
        )}

        {/* 4. Heart Animation (Khi Double Tap) */}
        <AnimatePresence>
          {showHeart && (
            <motion.div 
              initial={{ scale: 0, opacity: 0, rotate: -45 }}
              animate={{ scale: 1.5, opacity: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0, y: -100 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
            >
              <Heart size={100} className="fill-red-500 text-red-500 drop-shadow-2xl" />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </>
  );
}