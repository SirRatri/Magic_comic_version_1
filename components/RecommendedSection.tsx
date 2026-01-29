'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Comic } from '@/types';
import { 
  Sparkles, TrendingUp, History, 
  ChevronRight, ChevronLeft, Zap, 
  ThumbsUp, RefreshCw, Star, 
  Eye, Clock, Flame, 
  MoreHorizontal, PlayCircle, X 
} from 'lucide-react';
import debounce from 'lodash/debounce';

// --- 1. TYPE DEFINITIONS & AI MODELS (ĐỊNH NGHĨA DỮ LIỆU) ---

interface RecommendProps {
  initialComics: Comic[];
}

type TabType = 'foryou' | 'trending' | 'similar' | 'hidden_gems' | 'completed';

// Mô hình "DNA" của một bộ truyện để AI phân tích
interface ComicDNA extends Comic {
  tags: string[];         // Thể loại
  vibe: string;           // Cảm giác (VD: Dark, Wholesome, Hype)
  pacing: 'slow' | 'fast';// Nhịp truyện
  matchScore?: number;    // Điểm phù hợp với user (0-100)
  matchReason?: string;   // Lý do gợi ý
}

// Hồ sơ sở thích người dùng (Được học qua hành vi)
interface UserProfile {
  favoriteTags: Record<string, number>; // { 'Action': 5, 'Romance': 2 }
  viewedComics: number[]; // ID các truyện đã xem
  interactionScore: Record<number, number>; // ID truyện -> Điểm tương tác
}

// --- 2. THE CORE ENGINE (BỘ NÃO XỬ LÝ) ---

export default function RecommendedSection({ initialComics }: RecommendProps) {
  
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState<TabType>('foryou');
  const [comics, setComics] = useState<ComicDNA[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLearning, setIsLearning] = useState(false); // Trạng thái AI đang học
  const [userProfile, setUserProfile] = useState<UserProfile>({
    favoriteTags: {},
    viewedComics: [],
    interactionScore: {}
  });
  
  // Ref cho UI
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [hoveredComicId, setHoveredComicId] = useState<number | null>(null);

  // --- 3. AI ALGORITHMS (THUẬT TOÁN GỢI Ý) ---

  // A. Hàm khởi tạo dữ liệu giả lập (Enrich Data)
  // Vì DB thật chưa có cột 'tags', 'vibe', ta cần giả lập để thuật toán chạy
  const enrichComicsData = useCallback((rawComics: Comic[]): ComicDNA[] => {
    const vibes = ['Epic', 'Chill', 'Dark', 'Sweet', 'Funny', 'Intense'];
    const tagsList = ['Action', 'Romance', 'Fantasy', 'System', 'Reincarnation', 'Comedy'];
    
    return rawComics.map(c => ({
      ...c,
      // Random tags nếu chưa có
      tags: [
        tagsList[Math.floor(Math.random() * tagsList.length)],
        tagsList[Math.floor(Math.random() * tagsList.length)]
      ],
      vibe: vibes[Math.floor(Math.random() * vibes.length)],
      pacing: Math.random() > 0.5 ? 'fast' : 'slow',
      matchScore: 0, // Sẽ tính sau
    }));
  }, []);

  // B. Hàm tính điểm tương đồng (The Matching Engine)
  const calculateMatchScore = useCallback((comic: ComicDNA, profile: UserProfile) => {
    let score = 0;
    
    // 1. Tag Matching (Quan trọng nhất: 50%)
    comic.tags.forEach(tag => {
      if (profile.favoriteTags[tag]) {
        score += profile.favoriteTags[tag] * 10; // Mỗi điểm thích tag cộng 10 điểm
      }
    });

    // 2. Popularity Boost (Tăng điểm cho truyện hot: 20%)
    // Giả lập ID càng nhỏ là truyện càng cũ/nổi tiếng
    if (comic.id < 100) score += 15;

    // 3. Random Discovery (Yếu tố ngẫu nhiên để khám phá mới: 30%)
    score += Math.random() * 30;

    // Normalize về thang 100
    return Math.min(Math.round(score), 99);
  }, []);

  // C. Hàm "Học" hành vi người dùng (Behavior Learning)
  const learnFromInteraction = useCallback((comicId: number, type: 'view' | 'click' | 'hover') => {
    setUserProfile(prev => {
      const newProfile = { ...prev };
      const weight = type === 'click' ? 5 : (type === 'view' ? 1 : 0.5);
      
      // Cập nhật điểm tương tác
      newProfile.interactionScore[comicId] = (newProfile.interactionScore[comicId] || 0) + weight;
      
      // Nếu user click, lưu vào lịch sử xem
      if (type === 'click' && !newProfile.viewedComics.includes(comicId)) {
        newProfile.viewedComics.push(comicId);
      }
      
      return newProfile;
    });

    // Kích hoạt hiệu ứng "AI đang học" trên UI
    if (type === 'click') {
      setIsLearning(true);
      setTimeout(() => setIsLearning(false), 1500);
    }
  }, []);

  // D. Hàm tải và phân loại dữ liệu (Data Fetching & Sorting)
  const fetchAndRankComics = useCallback(async (tab: TabType) => {
    setIsLoading(true);
    
    // 1. Fetch dữ liệu thô từ Supabase
    let query = supabase.from('comics').select('*');
    
    if (tab === 'trending') query = query.order('updated_at', { ascending: false }).limit(20);
    else if (tab === 'completed') query = query.limit(20); // Cần filter status='completed'
    else query = query.limit(30); // Lấy nhiều hơn để lọc

    const { data } = await query;
    
    if (!data) {
        setIsLoading(false);
        return;
    }

    // 2. Chế biến dữ liệu (Data Processing Pipeline)
    let processedComics = enrichComicsData(data as Comic[]);

    // 3. Chấm điểm từng truyện dựa trên User Profile
    processedComics = processedComics.map(c => {
      const score = calculateMatchScore(c, userProfile);
      
      // Tạo lý do gợi ý (Explanation)
      let reason = "Mới cập nhật";
      if (score > 80) reason = "Rất hợp gu bạn";
      else if (score > 60) reason = "Xu hướng đang lên";
      else if (c.tags.some(t => userProfile.favoriteTags[t] > 5)) reason = `Vì bạn thích ${c.tags[0]}`;

      return { ...c, matchScore: score, matchReason: reason };
    });

    // 4. Sắp xếp theo Tab
    if (tab === 'foryou') {
      // Sort theo điểm Match giảm dần
      processedComics.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    } else if (tab === 'hidden_gems') {
      // Tìm truyện điểm cao nhưng ít người biết (Giả lập)
      processedComics = processedComics.filter(c => c.id > 50).sort(() => Math.random() - 0.5);
    }

    // Giả lập delay mạng để hiện Skeleton (Tăng trải nghiệm UX)
    setTimeout(() => {
      setComics(processedComics);
      setIsLoading(false);
    }, 800);

  }, [enrichComicsData, calculateMatchScore, userProfile]);

  // --- 4. LIFECYCLE HOOKS ---

  // Load User Profile từ LocalStorage khi mới vào
  useEffect(() => {
    const savedProfile = localStorage.getItem('magic_user_profile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    } else {
      // Profile mặc định cho người mới
      setUserProfile({
        favoriteTags: { 'Action': 5, 'Manhwa': 3 }, // Giả định
        viewedComics: [],
        interactionScore: {}
      });
    }
  }, []);

  // Khi Tab đổi hoặc Profile đổi -> Chạy lại thuật toán
  useEffect(() => {
    fetchAndRankComics(activeTab);
  }, [activeTab]); // Bỏ userProfile ra để tránh loop vô tận, chỉ chạy khi tab đổi

  // Lưu Profile khi user rời đi
  useEffect(() => {
    const saveProfile = () => {
      localStorage.setItem('magic_user_profile', JSON.stringify(userProfile));
    };
    window.addEventListener('beforeunload', saveProfile);
    return () => window.removeEventListener('beforeunload', saveProfile);
  }, [userProfile]);


  // --- 5. UI HELPER FUNCTIONS ---

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.8; // Cuộn 80% chiều rộng màn hình
      
      scrollContainerRef.current.scrollTo({
        left: direction === 'right' ? scrollLeft + scrollAmount : scrollLeft - scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // --- 6. RENDER COMPONENTS ---

  // Component Thẻ Tab (Tab Button)
  const TabButton = ({ id, label, icon: Icon, color }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`relative px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 overflow-hidden group ${
        activeTab === id 
        ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-105' 
        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
      }`}
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity bg-gradient-to-r ${color}`} />
      <Icon size={16} className={activeTab === id ? 'text-black' : 'text-gray-500 group-hover:text-white'} />
      {label}
      {activeTab === id && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-black rounded-full" />
      )}
    </button>
  );

  return (
    <section ref={sectionRef} className="py-16 relative overflow-hidden min-h-[600px]">
      
      {/* --- BACKGROUND FX (HIỆU ỨNG NỀN) --- */}
      <div className="absolute inset-0 bg-[#050505]">
         <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] animate-pulse-slow" />
         <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
         {/* Noise Texture */}
         <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* --- HEADER: INTELLIGENT GREETING --- */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-black tracking-[0.2em] text-[10px] uppercase">
               <Sparkles size={12} className="animate-spin-slow" />
               Magic Recommendation Engine v2.0
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
              Khám Phá <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-500">Vũ Trụ Truyện</span>
            </h2>
            
            <p className="text-gray-400 text-sm md:text-base max-w-xl">
              Hệ thống AI đang phân tích sở thích đọc của bạn để đề xuất những bộ truyện phù hợp nhất.
              {isLearning && <span className="text-green-400 font-bold ml-2 animate-pulse">• AI đang học từ thao tác của bạn...</span>}
            </p>
          </div>

          {/* --- SMART CONTROL TABS --- */}
          <div className="flex flex-wrap gap-3 p-1.5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
            <TabButton id="foryou" label="Dành Cho Bạn" icon={Zap} color="from-yellow-400 to-orange-500" />
            <TabButton id="trending" label="Thịnh Hành" icon={TrendingUp} color="from-red-500 to-pink-500" />
            <TabButton id="hidden_gems" label="Ngọc Ẩn" icon={Star} color="from-purple-500 to-indigo-500" />
            <TabButton id="completed" label="Đã Full" icon={RefreshCw} color="from-green-400 to-emerald-500" />
          </div>
        </div>

        {/* --- MAIN CONTENT: INFINITE CAROUSEL --- */}
        <div className="relative group/carousel">
          
          {/* Navigation Buttons (Nút bấm 2 bên) */}
          <button 
            onClick={() => scroll('left')}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-black/60 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white opacity-0 group-hover/carousel:opacity-100 transition-all hover:bg-primary hover:scale-110 hover:shadow-neon -translate-x-10 group-hover/carousel:translate-x-0 duration-300"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button 
            onClick={() => scroll('right')}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-black/60 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white opacity-0 group-hover/carousel:opacity-100 transition-all hover:bg-primary hover:scale-110 hover:shadow-neon translate-x-10 group-hover/carousel:translate-x-0 duration-300"
          >
            <ChevronRight size={24} />
          </button>

          {/* SCROLL CONTAINER */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-5 overflow-x-auto pb-12 pt-4 px-2 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none' }}
          >
            
            {/* --- LOADING SKELETON (HIỆU ỨNG TẢI DỮ LIỆU) --- */}
            {isLoading && [...Array(6)].map((_, i) => (
              <div key={i} className="min-w-[220px] md:min-w-[260px] snap-start animate-pulse">
                <div className="w-full aspect-[3/4] bg-white/5 rounded-3xl mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent animate-shimmer" />
                </div>
                <div className="h-5 bg-white/10 rounded w-3/4 mb-2" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
              </div>
            ))}

            {/* --- REAL COMIC CARDS (THẺ TRUYỆN THÔNG MINH) --- */}
            {!isLoading && comics.map((comic, index) => (
              <Link 
                key={comic.id}
                href={`/truyen/${comic.slug}`}
                onClick={() => learnFromInteraction(comic.id, 'click')}
                onMouseEnter={() => {
                  setHoveredComicId(comic.id);
                  learnFromInteraction(comic.id, 'hover');
                }}
                onMouseLeave={() => setHoveredComicId(null)}
                className="min-w-[220px] md:min-w-[260px] snap-start group relative transition-all duration-500 hover:-translate-y-3"
              >
                {/* 1. COMIC POSTER */}
                <div className={`relative w-full aspect-[3/4] rounded-3xl overflow-hidden mb-4 border border-white/10 bg-[#121212] transition-all duration-500 ${
                  hoveredComicId === comic.id ? 'shadow-[0_20px_50px_-10px_rgba(var(--primary),0.3)] border-primary/50' : ''
                }`}>
                  <Image
                    src={comic.thumbnail}
                    alt={comic.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className={`object-cover transition-transform duration-700 ${
                      hoveredComicId === comic.id ? 'scale-110 rotate-1' : 'scale-100'
                    }`}
                  />
                  
                  {/* AI Match Badge (Điểm phù hợp) */}
                  {comic.matchScore && comic.matchScore > 0 && (
                     <div className="absolute top-3 right-3 z-20">
                       <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full backdrop-blur-md border shadow-lg ${
                         comic.matchScore >= 80 
                           ? 'bg-green-500/20 border-green-500/50 text-green-400' 
                           : 'bg-white/10 border-white/20 text-white'
                       }`}>
                         <div className="relative w-2 h-2">
                            <div className="absolute inset-0 bg-current rounded-full opacity-50 animate-ping" />
                            <div className="relative w-2 h-2 bg-current rounded-full" />
                         </div>
                         <span className="text-xs font-black">{comic.matchScore}% Match</span>
                       </div>
                     </div>
                  )}

                  {/* Vibe Tag (Thể hiện "Chất" của truyện) */}
                  <div className="absolute top-3 left-3 z-20">
                     <span className="px-2 py-1 rounded-md bg-black/60 backdrop-blur text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">
                       {comic.vibe}
                     </span>
                  </div>

                  {/* OVERLAY INTERACTION (Hiện khi hover) */}
                  <div className={`absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 flex flex-col items-center justify-center gap-4 ${
                    hoveredComicId === comic.id ? 'opacity-100' : 'opacity-0'
                  }`}>
                     <button className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white shadow-neon transform transition-transform hover:scale-110">
                        <PlayCircle size={28} fill="white" />
                     </button>
                     
                     <div className="flex gap-2">
                       <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors" title="Thêm vào tủ sách">
                         <Star size={18} />
                       </button>
                       <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors" title="Xem nhanh">
                         <Eye size={18} />
                       </button>
                     </div>

                     {/* Lý do gợi ý */}
                     {comic.matchReason && (
                       <div className="absolute bottom-4 inset-x-4 text-center">
                         <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Tại sao gợi ý?</p>
                         <p className="text-xs font-bold text-white bg-white/10 py-1 px-2 rounded-lg inline-block">
                           {comic.matchReason}
                         </p>
                       </div>
                     )}
                  </div>

                  {/* Progress Bar (Giả lập tiến độ đọc) */}
                  {index === 0 && (
                    <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20">
                      <div className="h-full w-[45%] bg-primary" />
                    </div>
                  )}
                </div>

                {/* 2. COMIC INFO */}
                <div className="px-1 relative">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-2 h-5 overflow-hidden">
                    {comic.tags.map(tag => (
                      <span key={tag} className="text-[10px] text-gray-400 bg-white/5 px-1.5 rounded border border-white/5">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h3 className={`text-lg font-bold leading-tight line-clamp-2 mb-1 transition-colors ${
                    hoveredComicId === comic.id ? 'text-primary' : 'text-white'
                  }`}>
                    {comic.title}
                  </h3>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-2 border-t border-white/5 pt-2">
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {new Date(comic.updated_at).toLocaleDateString('vi-VN')}
                    </span>
                    <span className="flex items-center gap-1 text-yellow-500">
                      <Star size={10} fill="currentColor" /> 4.8
                    </span>
                  </div>
                </div>

                {/* Nút 3 chấm (More options) */}
                <button 
                  className="absolute top-0 right-0 p-2 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => { e.preventDefault(); /* Mở menu phụ */ }}
                >
                  <MoreHorizontal size={20} />
                </button>

              </Link>
            ))}

            {/* --- END CARD (THẺ KẾT THÚC) --- */}
            {!isLoading && (
              <div className="min-w-[200px] snap-start flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/10 rounded-3xl bg-white/[0.02] hover:bg-white/[0.05] hover:border-primary/30 transition-all cursor-pointer group/end">
                 <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover/end:scale-110 group-hover/end:rotate-180 transition-all duration-500">
                    <RefreshCw size={24} className="text-gray-400 group-hover/end:text-primary" />
                 </div>
                 <h4 className="font-bold text-white mb-1">Hết danh sách?</h4>
                 <p className="text-xs text-center text-gray-500 mb-4">
                   Bấm để AI tìm thêm truyện mới cho bạn
                 </p>
                 <button className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-neon hover:brightness-110 transition-all">
                   Tải Thêm Truyện
                 </button>
              </div>
            )}
          
          </div>
        </div>

      </div>
    </section>
  );
}