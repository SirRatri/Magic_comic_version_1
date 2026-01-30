"use client";

import React, { 
  useState, 
  useEffect, 
  useCallback, 
  useMemo, 
  useReducer, 
  useRef 
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

// --- 1. TYPES & INTERFACES (Định nghĩa kiểu dữ liệu chặt chẽ) ---

type ComicStatus = "Ongoing" | "Completed" | "Dropped";
type ViewMode = "Grid" | "List";

interface Comic {
  id: string;
  title: string;
  thumbnail: string;
  latestChapter: number;
  updatedAt: string; // ISO Date
  views: number;
  status: ComicStatus;
  tags: string[];
  isHot?: boolean;
}

interface FilterState {
  search: string;
  tags: string[];
  status: ComicStatus | "All";
  sortBy: "Newest" | "Views" | "A-Z";
}

// --- 2. MOCK DATA (Dữ liệu giả lập chuẩn chỉnh) ---
// Giả lập 4 bộ truyện như bạn yêu cầu, nhưng cấu trúc data sẵn sàng scale lên 1000 bộ
const MOCK_COMICS: Comic[] = [
  {
    id: "c1",
    title: "Độc Bộ Tiêu Dao",
    thumbnail: "https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=600&q=80",
    latestChapter: 320,
    updatedAt: new Date().toISOString(),
    views: 1500000,
    status: "Ongoing",
    tags: ["Action", "Martial Arts"],
    isHot: true,
  },
  {
    id: "c2",
    title: "Võ Luyện Đỉnh Phong",
    thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&q=80",
    latestChapter: 3500,
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    views: 50000000,
    status: "Ongoing",
    tags: ["Fantasy", "Adventure"],
    isHot: true,
  },
  {
    id: "c3",
    title: "Toàn Chức Pháp Sư",
    thumbnail: "https://images.unsplash.com/photo-1536053428945-8c76efde5e81?w=600&q=80",
    latestChapter: 800,
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    views: 890000,
    status: "Completed",
    tags: ["Magic", "School Life"],
  },
  {
    id: "c4",
    title: "Trọng Sinh Đô Thị",
    thumbnail: "https://images.unsplash.com/photo-1614726365203-c3df95a5f979?w=600&q=80",
    latestChapter: 150,
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    views: 450000,
    status: "Dropped",
    tags: ["Urban", "Reincarnation"],
  }
];

// --- 3. CUSTOM HOOKS (Tách logic xử lý) ---

// Hook: Debounce Search (Chờ người dùng gõ xong mới tìm)
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Hook: Intersection Observer (Dùng để Lazy load hoặc Infinite Scroll)
function useOnScreen(ref: React.RefObject<HTMLElement>, rootMargin = "0px") {
  const [isIntersecting, setIntersecting] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIntersecting(entry.isIntersecting),
      { rootMargin }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, rootMargin]);
  return isIntersecting;
}

// --- 4. REDUCER (Quản lý State phức tạp thay vì useState lắt nhắt) ---

type Action = 
  | { type: "SET_SEARCH"; payload: string }
  | { type: "TOGGLE_TAG"; payload: string }
  | { type: "SET_STATUS"; payload: ComicStatus | "All" }
  | { type: "SET_SORT"; payload: FilterState["sortBy"] }
  | { type: "RESET" };

const initialState: FilterState = {
  search: "",
  tags: [],
  status: "All",
  sortBy: "Newest",
};

function filterReducer(state: FilterState, action: Action): FilterState {
  switch (action.type) {
    case "SET_SEARCH":
      return { ...state, search: action.payload };
    case "TOGGLE_TAG":
      const tags = state.tags.includes(action.payload)
        ? state.tags.filter(t => t !== action.payload)
        : [...state.tags, action.payload];
      return { ...state, tags };
    case "SET_STATUS":
      return { ...state, status: action.payload };
    case "SET_SORT":
      return { ...state, sortBy: action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

// --- 5. MAIN COMPONENT ---

export default function HomePage() {
  const router = useRouter();
  
  // State Management
  const [state, dispatch] = useReducer(filterReducer, initialState);
  const [viewMode, setViewMode] = useState<ViewMode>("Grid");
  const [isLoading, setIsLoading] = useState(false);
  const [displayData, setDisplayData] = useState<Comic[]>(MOCK_COMICS);

  // Debounce search input để tối ưu performance
  const debouncedSearch = useDebounce(state.search, 300);

  // Ref cho scroll to top button
  const topRef = useRef<HTMLDivElement>(null);
  const showTopBtn = !useOnScreen(topRef); // Khi cái div top khuất màn hình thì hiện nút

  // LOGIC: Filter & Sort (Dùng useMemo để cache kết quả tính toán)
  const filteredComics = useMemo(() => {
    let result = [...MOCK_COMICS];

    // 1. Filter by Search
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(c => c.title.toLowerCase().includes(q));
    }

    // 2. Filter by Tags
    if (state.tags.length > 0) {
      result = result.filter(c => state.tags.every(t => c.tags.includes(t)));
    }

    // 3. Filter by Status
    if (state.status !== "All") {
      result = result.filter(c => c.status === state.status);
    }

    // 4. Sorting
    result.sort((a, b) => {
      if (state.sortBy === "Newest") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (state.sortBy === "Views") return b.views - a.views;
      if (state.sortBy === "A-Z") return a.title.localeCompare(b.title);
      return 0;
    });

    return result;
  }, [debouncedSearch, state.tags, state.status, state.sortBy]);

  // Effect: Update UI khi filter thay đổi (Giả lập call API)
  useEffect(() => {
    setIsLoading(true);
    // Giả lập delay mạng 0.5s cho cảm giác "thật"
    const timer = setTimeout(() => {
      setDisplayData(filteredComics);
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [filteredComics]);

  // Handlers (Tối ưu bằng useCallback)
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "SET_SEARCH", payload: e.target.value });
  }, []);

  const handleTagClick = useCallback((tag: string) => {
    dispatch({ type: "TOGGLE_TAG", payload: tag });
  }, []);

  // --- RENDER UI ---
  // Lưu ý: ClassName mình để trống hoặc đặt tên ngữ nghĩa (semantic) 
  // để bạn dễ dàng điền Tailwind vào sau này.

  return (
    <div className="wrapper-container">
      {/* Anchor div để check scroll */}
      <div ref={topRef} className="scroll-anchor" />

      {/* --- HEADER SECTION --- */}
      <header className="header-section">
        <div className="logo-area">
           <h1>Magic<span className="highlight">Comic</span></h1>
        </div>
        
        <div className="search-bar-container">
          <input 
            type="text" 
            placeholder="Tìm kiếm truyện..." 
            value={state.search}
            onChange={handleSearchChange}
            className="search-input"
          />
          {state.search && (
             <button onClick={() => dispatch({type: "SET_SEARCH", payload: ""})} className="clear-btn">
               X
             </button>
          )}
        </div>

        <div className="user-actions">
           <button className="login-btn">Đăng nhập</button>
        </div>
      </header>

      {/* --- FILTER & CONTROLS --- */}
      <section className="controls-section">
        <div className="filter-group">
          <select 
            value={state.status} 
            onChange={(e) => dispatch({type: "SET_STATUS", payload: e.target.value as any})}
            className="dropdown"
          >
            <option value="All">Tất cả trạng thái</option>
            <option value="Ongoing">Đang tiến hành</option>
            <option value="Completed">Đã hoàn thành</option>
          </select>

          <select 
            value={state.sortBy} 
            onChange={(e) => dispatch({type: "SET_SORT", payload: e.target.value as any})}
            className="dropdown"
          >
            <option value="Newest">Mới cập nhật</option>
            <option value="Views">Xem nhiều nhất</option>
            <option value="A-Z">Tên A-Z</option>
          </select>
        </div>

        <div className="view-toggle">
          <button 
            onClick={() => setViewMode("Grid")} 
            className={`toggle-btn ${viewMode === "Grid" ? "active" : ""}`}
          >
            Lưới
          </button>
          <button 
            onClick={() => setViewMode("List")} 
            className={`toggle-btn ${viewMode === "List" ? "active" : ""}`}
          >
            Danh sách
          </button>
        </div>
      </section>

      {/* --- TAGS CLOUD --- */}
      <section className="tags-section">
        {["Action", "Fantasy", "Romance", "Horror", "Comedy"].map(tag => (
          <button
            key={tag}
            onClick={() => handleTagClick(tag)}
            className={`tag-pill ${state.tags.includes(tag) ? "selected" : ""}`}
          >
            {tag}
          </button>
        ))}
        {state.tags.length > 0 && (
          <button onClick={() => dispatch({type: "RESET"})} className="reset-filter">
            Xóa lọc
          </button>
        )}
      </section>

      {/* --- MAIN CONTENT (COMIC LIST) --- */}
      <main className="content-area">
        {isLoading ? (
          // Skeleton Loading State
          <div className={`skeleton-grid ${viewMode}`}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton-item" style={{height: 300, background: '#eee'}}></div>
            ))}
          </div>
        ) : displayData.length === 0 ? (
          // Empty State
          <div className="empty-state">
            <h3>Không tìm thấy truyện nào!</h3>
            <p>Thử tìm từ khóa khác xem sao...</p>
          </div>
        ) : (
          // Data Grid
          <div className={`comic-grid-system ${viewMode === 'Grid' ? 'grid-view' : 'list-view'}`}>
            {displayData.map((comic) => (
              <article key={comic.id} className="comic-card">
                
                {/* Comic Thumbnail */}
                <div className="card-image-wrapper">
                  {comic.isHot && <span className="hot-badge">HOT</span>}
                  <div className="image-container" style={{ position: 'relative', width: '100%', aspectRatio: '2/3' }}>
                     <Image 
                       src={comic.thumbnail} 
                       alt={comic.title}
                       fill
                       sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                       className="comic-cover"
                       style={{ objectFit: 'cover' }}
                       loading="lazy"
                     />
                  </div>
                  {/* Overlay khi hover (cho PC) */}
                  <div className="hover-overlay">
                    <button className="read-now-btn">Đọc ngay</button>
                  </div>
                </div>

                {/* Comic Info */}
                <div className="card-content">
                  <h3 className="comic-title" title={comic.title}>
                    <Link href={`/truyen/${comic.id}`}>{comic.title}</Link>
                  </h3>
                  
                  <div className="comic-meta">
                    <span className="chapter-badge">Chap {comic.latestChapter}</span>
                    <span className="time-ago">
                        {new Date(comic.updatedAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <div className="comic-stats">
                    <span>👁️ {(comic.views / 1000).toFixed(1)}K</span>
                    <span className={`status-dot ${comic.status.toLowerCase()}`}>
                      {comic.status}
                    </span>
                  </div>

                  {/* Tags nhỏ trong card */}
                  <div className="card-tags">
                     {comic.tags.slice(0, 2).map(t => (
                       <span key={t} className="mini-tag">{t}</span>
                     ))}
                  </div>
                </div>

              </article>
            ))}
          </div>
        )}
      </main>

      {/* --- PAGINATION / LOAD MORE --- */}
      <div className="pagination-area">
         <button className="load-more-btn" disabled={isLoading}>
            {isLoading ? "Đang tải..." : "Xem thêm truyện"}
         </button>
      </div>

      {/* --- FOOTER --- */}
      <footer className="page-footer">
         <p>&copy; 2026 MagicComic. Nền tảng đọc truyện tối ưu.</p>
      </footer>

      {/* --- SCROLL TO TOP BTN --- */}
      <button 
        className={`scroll-top-btn ${showTopBtn ? "visible" : "hidden"}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        ⬆
      </button>

    </div>
  );
}