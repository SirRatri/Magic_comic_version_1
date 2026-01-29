'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useInView } from 'react-intersection-observer';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { X, Play, Lock, AlertCircle, Loader2, Volume2, VolumeX, SkipForward } from 'lucide-react';
import { toast } from 'sonner';

// --- 1. CONFIGURATION (CẤU HÌNH HỆ THỐNG) ---
const CONFIG = {
  AD_INTERVAL: 7, // Số chương đọc thì hiện quảng cáo video
  VIDEO_AD_DURATION: 15, // Thời gian bắt buộc xem video (giây)
  PARALLAX_SCROLL_HEIGHT: '150vh', // Chiều cao vùng quảng cáo lướt (càng cao lướt càng lâu)
  LAZY_LOAD_THRESHOLD: 0.2, // Tỉ lệ ảnh xuất hiện thì mới bắt đầu tải
};

// --- 2. TYPES ---
interface ChapterViewerProps {
  images: string[];
  chapterId: number;
  nextChapterSlug: string | null;
}

// --- 3. SUB-COMPONENT: QUẢNG CÁO VIDEO (LOCK MODAL) ---
const VideoUnlockModal = ({ onUnlock }: { onUnlock: () => void }) => {
  const [timeLeft, setTimeLeft] = useState(CONFIG.VIDEO_AD_DURATION);
  const [canSkip, setCanSkip] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      <div className="relative w-full h-full max-w-4xl max-h-[80vh] bg-black flex flex-col">
        {/* Fake Video Player UI */}
        <div className="flex-1 relative bg-gray-900 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
          
          {/* Giả lập Video đang chạy */}
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }} 
            transition={{ duration: 5, repeat: Infinity }}
            className="text-center space-y-4"
          >
            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
               <Play size={40} className="text-primary fill-primary" />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-widest">
              SPONSOR ADVERTISEMENT
            </h3>
            <p className="text-gray-400">Đang tải nội dung quảng cáo chất lượng cao...</p>
          </motion.div>

          {/* Controls */}
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="absolute bottom-8 right-8 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            {isMuted ? <VolumeX color="white" /> : <Volume2 color="white" />}
          </button>
        </div>

        {/* Footer Bar */}
        <div className="h-20 bg-[#121212] flex items-center justify-between px-6 border-t border-white/10">
          <div className="flex items-center gap-4">
             <div className="text-xs text-gray-500">Quảng cáo giúp duy trì server</div>
             <div className="h-1 w-32 bg-gray-800 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }} 
                 animate={{ width: '100%' }} 
                 transition={{ duration: CONFIG.VIDEO_AD_DURATION, ease: 'linear' }}
                 className="h-full bg-primary" 
               />
             </div>
          </div>

          {canSkip ? (
            <button 
              onClick={onUnlock}
              className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform"
            >
              BỎ QUA QUẢNG CÁO <SkipForward size={18} />
            </button>
          ) : (
            <div className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-gray-400 font-bold rounded-xl cursor-not-allowed opacity-50">
              <Loader2 size={18} className="animate-spin" /> 
              CÓ THỂ BỎ QUA SAU {timeLeft}s
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- 4. SUB-COMPONENT: QUẢNG CÁO PARALLAX (IN-FEED AD) ---
// Đây là công nghệ "Lướt 2 lần mới qua"
const ParallaxInFeedAd = ({ id }: { id: number }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Hiệu ứng Parallax: Background di chuyển chậm hơn tốc độ lướt
  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <div ref={containerRef} className="relative w-full my-4" style={{ height: CONFIG.PARALLAX_SCROLL_HEIGHT }}>
      {/* Sticky Container: Giữ quảng cáo đứng yên khi lướt */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        
        {/* Background Quảng cáo */}
        <motion.div 
          style={{ y, opacity }}
          className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center z-10"
        >
          <div className="relative w-full max-w-md aspect-[9/16] bg-gray-800 rounded-lg overflow-hidden border border-primary/30 shadow-[0_0_50px_rgba(var(--primary),0.2)]">
            {/* Giả lập nội dung quảng cáo */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded mb-4">ADS #{id}</span>
              <h3 className="text-3xl font-black text-white mb-2">SIÊU PHẨM GAME 2026</h3>
              <p className="text-gray-400 text-sm mb-6">Chơi ngay để nhận Giftcode trị giá 5 triệu đồng.</p>
              <button className="px-8 py-3 bg-primary text-white font-bold rounded-full animate-bounce">
                TẢI NGAY
              </button>
            </div>
            
            {/* Thanh tiến trình lướt bắt buộc */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-4 backdrop-blur-sm">
              <p className="text-center text-xs text-gray-400 mb-2 uppercase tracking-widest">
                Lướt thêm để tiếp tục đọc
              </p>
              <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                 <motion.div 
                    style={{ scaleX: scrollYProgress }} 
                    className="h-full bg-primary origin-left"
                 />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Lớp phủ mờ (Vignette) */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black via-transparent to-black opacity-80 z-20" />
      </div>
    </div>
  );
};

// --- 5. SUB-COMPONENT: ẢNH TRUYỆN THÔNG MINH (SMART IMAGE) ---
const SmartImage = ({ src, index, priority = false }: { src: string, index: number, priority?: boolean }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true, // Chỉ load 1 lần
    rootMargin: '200px 0px', // Load trước khi lướt tới 200px (Preload)
    threshold: 0,
  });

  // Retry Logic
  const handleRetry = () => {
    setHasError(false);
    // Hack: Thêm query param để force reload ảnh
    const newSrc = src.includes('?') ? `${src}&retry=${Date.now()}` : `${src}?retry=${Date.now()}`;
    // (Ở đây chỉ demo state, thực tế cần update src prop)
  };

  return (
    <div 
      ref={ref} 
      className="relative w-full min-h-[300px] md:min-h-[600px] bg-gray-900 overflow-hidden"
    >
      {/* Loading Skeleton (Hiệu ứng quét sáng) */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 z-10">
          <div className="w-full h-full bg-gray-800 animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
          <div className="absolute inset-0 flex items-center justify-center">
             <Loader2 className="w-8 h-8 text-gray-600 animate-spin" />
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-900 border-y border-red-900/30">
          <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
          <p className="text-gray-400 text-sm mb-4">Ảnh bị lỗi tải</p>
          <button 
            onClick={handleRetry}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-white transition-colors"
          >
            THỬ LẠI
          </button>
        </div>
      )}

      {/* Main Image */}
      {(inView || priority) && (
        <Image
          src={src}
          alt={`Page ${index + 1}`}
          width={1000} // Kích thước giả định, Next.js sẽ tự scale
          height={1400}
          quality={priority ? 90 : 75} // Ảnh đầu nét, ảnh sau nén hơn chút cho nhanh
          priority={priority}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-auto transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading={priority ? 'eager' : 'lazy'}
        />
      )}
      
      {/* Số trang mờ (Watermark) */}
      <span className="absolute top-2 right-2 text-[10px] text-white/20 font-mono font-bold select-none z-10 pointer-events-none mix-blend-difference">
        {index + 1}
      </span>
    </div>
  );
};

// --- 6. MAIN COMPONENT: CHAPTER VIEWER (TRUNG TÂM ĐIỀU KHIỂN) ---
export default function ChapterViewer({ images, chapterId, nextChapterSlug }: ChapterViewerProps) {
  const [isLocked, setIsLocked] = useState(false);
  
  // --- A. LOGIC ĐẾM SỐ LẦN ĐỌC & KHÓA CHAPTER ---
  useEffect(() => {
    // Lấy số chương đã đọc từ LocalStorage
    const readCount = parseInt(localStorage.getItem('read_count') || '0', 10);
    const newCount = readCount + 1;
    
    // Lưu lại số mới
    localStorage.setItem('read_count', newCount.toString());

    // Kiểm tra điều kiện khóa (Mỗi 7 chương)
    if (newCount % CONFIG.AD_INTERVAL === 0) {
      setIsLocked(true);
      // Khóa thanh cuộn màn hình
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = 'auto'; // Mở khóa khi thoát
    };
  }, [chapterId]);

  const handleUnlock = () => {
    setIsLocked(false);
    document.body.style.overflow = 'auto';
    toast.success('Đã mở khóa chương mới! Cảm ơn bạn.');
  };

  // --- B. LOGIC CHÈN QUẢNG CÁO PARALLAX VÀO GIỮA ẢNH ---
  // Tính toán vị trí chèn: 1 cái ở 1/3, 1 cái ở 2/3
  const renderList = useMemo(() => {
    const list = [];
    const adPosition1 = Math.floor(images.length / 3);
    const adPosition2 = Math.floor(images.length * 2 / 3);

    for (let i = 0; i < images.length; i++) {
      // 1. Render Ảnh truyện
      list.push(
        <SmartImage 
          key={`img-${i}`} 
          src={images[i]} 
          index={i} 
          priority={i < 2} // Ưu tiên tải 2 ảnh đầu tiên siêu nét
        />
      );

      // 2. Chèn Quảng cáo Parallax 1
      if (i === adPosition1) {
        list.push(<ParallaxInFeedAd key="ad-1" id={1} />);
      }

      // 3. Chèn Quảng cáo Parallax 2
      if (i === adPosition2) {
        list.push(<ParallaxInFeedAd key="ad-2" id={2} />);
      }
    }
    return list;
  }, [images]);

  return (
    <div className="relative w-full bg-black min-h-screen">
      
      {/* 1. MÀN HÌNH KHÓA VIDEO (Hiện lên nếu trúng lượt) */}
      <AnimatePresence>
        {isLocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <VideoUnlockModal onUnlock={handleUnlock} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. KHUNG CHỨA ẢNH & QUẢNG CÁO */}
      <div className={`w-full max-w-3xl mx-auto shadow-2xl ${isLocked ? 'blur-sm pointer-events-none' : ''}`}>
        {renderList}
      </div>

      {/* 3. LOADING FOOTER (Khi hết truyện) */}
      <div className="h-32 flex flex-col items-center justify-center text-gray-500 gap-2">
         {nextChapterSlug ? (
           <>
             <Loader2 className="animate-spin" />
             <span className="text-xs uppercase tracking-widest">Đang tải chương tiếp theo...</span>
           </>
         ) : (
           <span className="text-xs uppercase tracking-widest">Hết chương</span>
         )}
      </div>

    </div>
  );
}