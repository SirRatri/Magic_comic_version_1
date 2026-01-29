'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { Comic } from '@/types'; // Đảm bảo bạn đã có file types.ts như bài trước

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Comic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Kỹ thuật Debounce: Chỉ tìm kiếm khi người dùng ngừng gõ 500ms
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 1) { // Gõ trên 1 ký tự mới tìm
        setIsLoading(true);
        setIsOpen(true);
        
        // Gọi Supabase tìm theo tên (không phân biệt hoa thường)
        const { data } = await supabase
          .from('comics')
          .select('id, title, thumbnail, slug, author')
          .ilike('title', `%${query}%`)
          .limit(5); // Chỉ lấy 5 kết quả gọn nhẹ

        setResults((data as Comic[]) || []);
        setIsLoading(false);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 500); // Delay 500ms

    return () => clearTimeout(timer);
  }, [query]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl mx-auto z-50">
      {/* 1. KHUNG INPUT CHÍNH */}
      <div className={`
        relative flex items-center w-full bg-[#1a1a1a]/80 backdrop-blur-md 
        border border-gray-700 rounded-2xl transition-all duration-300
        ${isOpen ? 'rounded-b-none border-primary/50 shadow-[0_0_15px_rgba(255,75,31,0.3)]' : 'hover:border-gray-500'}
      `}>
        {/* Icon Search bên trái */}
        <div className="pl-4">
          <Search className={`w-5 h-5 transition-colors ${isOpen ? 'text-primary' : 'text-gray-400'}`} />
        </div>

        {/* Input nhập liệu */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 1 && setIsOpen(true)}
          placeholder="Tìm truyện, tác giả..."
          className="w-full bg-transparent p-4 text-white placeholder-gray-500 focus:outline-none text-sm font-medium"
        />

        {/* Loading Spinner hoặc Nút Xóa */}
        <div className="pr-4">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          ) : query && (
            <button onClick={() => { setQuery(''); setResults([]); setIsOpen(false); }}>
              <X className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
            </button>
          )}
        </div>
      </div>

      {/* 2. DROPDOWN KẾT QUẢ (Xổ xuống) */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#1a1a1a] border-x border-b border-gray-700 rounded-b-2xl overflow-hidden shadow-2xl">
          {results.length > 0 ? (
            <ul>
              {results.map((comic) => (
                <li key={comic.id} className="border-t border-gray-800">
                  <Link 
                    href={`/truyen/${comic.slug}`} 
                    className="flex items-center gap-3 p-3 hover:bg-gray-800 transition-colors group"
                    onClick={() => setIsOpen(false)}
                  >
                    {/* Ảnh nhỏ thumbnail */}
                    <div className="relative w-10 h-14 flex-shrink-0 rounded overflow-hidden">
                      <Image 
                        src={comic.thumbnail} 
                        alt={comic.title} 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform"
                        sizes="40px"
                      />
                    </div>
                    {/* Thông tin */}
                    <div>
                      <h4 className="text-sm font-bold text-gray-200 group-hover:text-primary transition-colors line-clamp-1">
                        {comic.title}
                      </h4>
                      <p className="text-xs text-gray-500">{comic.author}</p>
                    </div>
                  </Link>
                </li>
              ))}
              {/* Nút xem tất cả */}
              <li className="border-t border-gray-800">
                <button 
                  onClick={() => router.push(`/tim-kiem?q=${query}`)}
                  className="w-full p-3 text-xs text-center text-gray-400 hover:text-primary hover:bg-gray-800 transition-colors font-semibold uppercase tracking-wide"
                >
                  Xem tất cả kết quả cho "{query}"
                </button>
              </li>
            </ul>
          ) : (
            // Trạng thái không tìm thấy
            !isLoading && (
              <div className="p-8 text-center text-gray-500">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Không tìm thấy truyện nào...</p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}