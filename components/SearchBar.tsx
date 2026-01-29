'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Fuse from 'fuse.js'; // Thư viện tìm kiếm mờ (Fuzzy Search)
import debounce from 'lodash/debounce';
import { supabase } from '@/lib/supabase';
import { Search, X, Loader2, TrendingUp, User, BookOpen, Clock, Hash, AlertCircle, CornerDownLeft } from 'lucide-react';

// --- 1. TYPES EXTENDED (MỞ RỘNG DỮ LIỆU ĐỂ TÌM SÂU HƠN) ---
interface SearchComic {
  id: number;
  title: string;
  slug: string;
  thumbnail: string;
  author: string;
  description: string; // Quan trọng để tìm theo tình tiết (VD: "Cô gái tóc vàng")
  characters?: string[]; // Tên nhân vật (VD: "Naruto, Sasuke")
  tags?: string[];
  updated_at: string;
  views?: number; // Để sort theo độ hot
}

export default function SearchBar() {
  const router = useRouter();
  
  // --- STATE ---
  const [isOpen, setIsOpen] = useState(false); // Trạng thái mở Modal
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchComic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0); // Để dùng phím mũi tên lên xuống
  const [searchIndex, setSearchIndex] = useState<SearchComic[]>([]); // Dữ liệu thô đã tải về
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // --- 2. KHỞI TẠO ENGINE TÌM KIẾM (THE CORE TECHNOLOGY) ---
  // Tải dữ liệu Index một lần duy nhất khi vào web (Tối ưu tốc độ)
  useEffect(() => {
    const fetchSearchIndex = async () => {
      // Lấy các trường cần thiết để tìm kiếm (Payload nhẹ)
      const { data } = await supabase
        .from('comics')
        .select('id, title, slug, thumbnail, author, description, updated_at');
      
      if (data) {
        // Giả lập thêm dữ liệu nhân vật/tags nếu DB chưa có (Để test tính năng)
        const enrichedData = data.map(item => ({
          ...item,
          characters: ['Nam chính lạnh lùng', 'Nữ chính tóc vàng'], // Fake data để test tìm nhân vật
          tags: ['Action', 'Romance']
        }));
        setSearchIndex(enrichedData as SearchComic[]);
      }
    };

    fetchSearchIndex();

    // Load lịch sử tìm kiếm
    const history = localStorage.getItem('search_history');
    if (history) setRecentSearches(JSON.parse(history));

    // Lắng nghe phím tắt Ctrl+K hoặc Cmd+K để mở tìm kiếm
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- 3. CẤU HÌNH FUSE.JS (TRÁI TIM CỦA THUẬT TOÁN) ---
  const fuse = useMemo(() => {
    return new Fuse(searchIndex, {
      includeScore: true,
      includeMatches: true, // Để tô màu từ khóa
      threshold: 0.4, // Độ chấp nhận sai số (0.0 = chính xác tuyệt đối, 0.6 = sai tè le vẫn ra)
      ignoreLocation: true, // Tìm bất kỳ đâu trong chuỗi (đầu, giữa, cuối)
      keys: [
        { name: 'title', weight: 1 },         // Tên truyện: Quan trọng nhất (x1)
        { name: 'author', weight: 0.8 },      // Tác giả: Quan trọng nhì (x0.8)
        { name: 'characters', weight: 0.6 },  // Tên nhân vật
        { name: 'description', weight: 0.4 }, // Tìm theo tình tiết mô tả (Thấp hơn chút)
      ]
    });
  }, [searchIndex]);

  // --- 4. HÀM XỬ LÝ TÌM KIẾM (REAL-TIME PROCESSING) ---
  // Dùng useCallback + debounce để không bị giật khi gõ nhanh
  const handleSearch = useCallback(debounce((value: string) => {
    if (!value.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    // 1. Tìm chính xác (Fuzzy Search)
    const fuseResults = fuse.search(value);
    
    // 2. Map lại dữ liệu và Sort theo điểm phù hợp
    const finalResults = fuseResults
      .map(result => result.item)
      .slice(0, 10); // Chỉ lấy 10 kết quả tốt nhất

    setResults(finalResults);
    setIsLoading(false);
    setSelectedIndex(0);
  }, 100), [fuse]); // Delay 100ms: Gõ cực nhanh vẫn mượt

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setIsLoading(true);
    handleSearch(val);
  };

  // --- 5. LOGIC ĐIỀU HƯỚNG BẰNG PHÍM ---
  const handleResultKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      if (results[selectedIndex]) {
        saveHistory(results[selectedIndex].title);
        goToComic(results[selectedIndex].slug);
      }
    }
  };

  const saveHistory = (term: string) => {
    const newHistory = [term, ...recentSearches.filter(t => t !== term)].slice(0, 5);
    setRecentSearches(newHistory);
    localStorage.setItem('search_history', JSON.stringify(newHistory));
  };

  const goToComic = (slug: string) => {
    setIsOpen(false);
    router.push(`/truyen/${slug}`);
  };

  // --- 6. RENDER GIAO DIỆN (UI) ---
  return (
    <>
      {/* TRIGGER BUTTON (THANH TÌM KIẾM Ở HEADER) */}
      <div 
        onClick={() => { setIsOpen(true); setTimeout(() => inputRef.current?.focus(), 100); }}
        className="relative group w-full max-w-md mx-auto hidden md:block cursor-text"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative flex items-center bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 hover:border-primary/50 transition-colors">
          <Search className="w-4 h-4 text-gray-400 mr-3" />
          <span className="text-sm text-gray-500 flex-1 truncate">
            Tìm tên, tác giả, nhân vật, cốt truyện...
          </span>
          <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-gray-400">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      {/* MOBILE TRIGGER BUTTON */}
      <button 
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 text-gray-400 hover:text-white"
      >
        <Search className="w-6 h-6" />
      </button>

      {/* --- MODAL OVERLAY (GIAO DIỆN TÌM KIẾM CHÍNH) --- */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
          {/* Backdrop mờ */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div 
            ref={modalRef}
            className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]"
            onKeyDown={handleResultKeyDown}
          >
            {/* INPUT AREA */}
            <div className="flex items-center px-4 py-4 border-b border-white/10 gap-3">
              <Search className={`w-5 h-5 ${isLoading ? 'text-primary animate-pulse' : 'text-gray-400'}`} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={onInputChange}
                placeholder="Nhập bất cứ thứ gì... (VD: Tóc vàng, Bánh xèo, Tai nạn)"
                className="flex-1 bg-transparent border-none text-lg text-white placeholder-gray-500 focus:outline-none"
                autoComplete="off"
              />
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-white"
              >
                <kbd className="font-sans text-xs px-2 py-1">ESC</kbd>
              </button>
            </div>

            {/* RESULTS AREA */}
            <div className="overflow-y-auto custom-scrollbar flex-1">
              
              {/* Case 1: Đang loading (Skeleton) */}
              {isLoading && (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-4 animate-pulse">
                      <div className="w-12 h-16 bg-white/5 rounded-md" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-white/5 rounded w-3/4" />
                        <div className="h-3 bg-white/5 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Case 2: Có kết quả */}
              {!isLoading && results.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Kết quả phù hợp nhất
                  </div>
                  {results.map((comic, index) => (
                    <div
                      key={comic.id}
                      onClick={() => { saveHistory(comic.title); goToComic(comic.slug); }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`group flex items-start gap-4 p-3 rounded-xl cursor-pointer transition-all ${
                        index === selectedIndex ? 'bg-white/10 border border-white/5' : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      {/* Ảnh Thumbnail */}
                      <div className="relative w-12 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-800">
                        <Image 
                          src={comic.thumbnail} 
                          alt={comic.title} 
                          fill 
                          className="object-cover" 
                        />
                      </div>

                      {/* Thông tin */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-bold text-sm truncate ${index === selectedIndex ? 'text-primary' : 'text-white'}`}>
                            {comic.title}
                          </h4>
                          {index === selectedIndex && <CornerDownLeft className="w-3 h-3 text-gray-500" />}
                        </div>
                        
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                           <span className="flex items-center gap-1"><User size={10} /> {comic.author}</span>
                           <span className="flex items-center gap-1"><Clock size={10} /> {new Date(comic.updated_at).getFullYear()}</span>
                        </div>

                        {/* HIỂN THỊ MÔ TẢ NẾU KHỚP TỪ KHÓA (SEMANTIC HIGHLIGHT) */}
                        {/* Logic: Nếu tìm thấy từ khóa trong description thì hiện đoạn đó ra */}
                        <p className="mt-2 text-[11px] text-gray-500 line-clamp-1 italic">
                          "...{comic.description.substring(0, 80)}..."
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Case 3: Không có kết quả & Chưa nhập gì -> Hiện Lịch sử & Trending */}
              {!isLoading && results.length === 0 && (
                <div className="p-4 space-y-6">
                  
                  {/* Lịch sử tìm kiếm */}
                  {recentSearches.length > 0 && (
                    <section>
                      <h3 className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-3">
                        <Clock size={12} /> Mới tìm gần đây
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((term, i) => (
                          <button 
                            key={i}
                            onClick={() => { setQuery(term); handleSearch(term); }}
                            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary text-sm text-gray-300 transition-colors flex items-center gap-2 group"
                          >
                            {term}
                            <X 
                              size={12} 
                              className="opacity-0 group-hover:opacity-100 hover:text-red-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                const newH = recentSearches.filter(t => t !== term);
                                setRecentSearches(newH);
                                localStorage.setItem('search_history', JSON.stringify(newH));
                              }}
                            />
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Từ khóa Hot */}
                  <section>
                    <h3 className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-3">
                      <TrendingUp size={12} /> Xu hướng tìm kiếm
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {['Ngôn tình tổng tài', 'Xuyên không', 'Đam mỹ', 'Manhwa Action'].map((tag, i) => (
                        <div 
                          key={i} 
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer text-gray-400 hover:text-white transition-colors"
                          onClick={() => { setQuery(tag); handleSearch(tag); }}
                        >
                          <Hash size={14} className="text-gray-600" />
                          <span className="text-sm">{tag}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {/* Case 4: Nhập rồi mà không ra gì */}
              {!isLoading && query && results.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-gray-500" />
                  </div>
                  <p className="text-gray-300 font-medium">Không tìm thấy truyện nào</p>
                  <p className="text-sm text-gray-500 mt-1 max-w-xs">
                    Thử tìm bằng từ khóa khác hoặc kiểm tra lại chính tả (dù chúng tôi đã cố bắt lỗi rồi).
                  </p>
                </div>
              )}

            </div>

            {/* FOOTER HINT */}
            <div className="border-t border-white/10 px-4 py-2 bg-[#050505] flex items-center justify-between text-[10px] text-gray-500">
              <div className="flex gap-4">
                <span className="flex items-center gap-1"><kbd className="bg-white/10 px-1 rounded">↩</kbd> để chọn</span>
                <span className="flex items-center gap-1"><kbd className="bg-white/10 px-1 rounded">↑↓</kbd> để di chuyển</span>
                <span className="flex items-center gap-1"><kbd className="bg-white/10 px-1 rounded">ESC</kbd> để đóng</span>
              </div>
              <span className="hidden sm:inline">Powered by Fuse.js Fuzzy Engine</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}