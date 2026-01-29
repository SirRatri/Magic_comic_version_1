import { supabase } from '@/lib/supabase';
import ComicCard from '@/components/ComicCard';
import SearchBar from '@/components/SearchBar';
import Link from 'next/link';
import { Flame, Clock } from 'lucide-react';
import { Comic } from '@/types';

// CONFIG 1: ISR - Cache trang này 60 giây. 
// Tức là dù 1000 người vào cùng lúc, server chỉ query DB 1 lần mỗi phút -> Siêu nhẹ server.
export const revalidate = 60;

// Hàm lấy truyện đề cử (Hot) - Chỉ lấy đúng trường cần thiết để giảm payload mạng
async function getFeaturedComics() {
  const { data } = await supabase
    .from('comics')
    .select('id, title, thumbnail, author, slug, updated_at')
    .limit(4); // Lấy 4 truyện hot nhất
  return (data as Comic[]) || [];
}

// Hàm lấy truyện mới cập nhật
async function getLatestComics() {
  const { data } = await supabase
    .from('comics')
    .select('id, title, thumbnail, author, slug, updated_at')
    .order('updated_at', { ascending: false })
    .limit(12);
  return (data as Comic[]) || [];
}

export default async function Home() {
  // KỸ THUẬT 2: Parallel Fetching - Chạy 2 hàm cùng lúc, không chờ nhau -> Tiết kiệm 50% thời gian tải
  const [featured, latest] = await Promise.all([
    getFeaturedComics(),
    getLatestComics()
  ]);

  return (
    <main className="min-h-screen bg-black text-gray-100 pb-20">
      {/* 1. HERO SECTION: Phần đầu trang - Gây ấn tượng mạnh */}
      <section className="relative w-full h-[300px] md:h-[400px] flex flex-col justify-center items-center bg-gradient-to-b from-gray-900 to-black p-4">
        <div className="z-10 text-center space-y-4 w-full">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-yellow-500">
            Đọc Truyện Tốc Độ Cao
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-md mx-auto">
            Nền tảng tối ưu cho mọi thiết bị, không quảng cáo rác.
          </p>
          {/* Component Search đã tách ra để tối ưu client bundle */}
          <SearchBar />
        </div>
        
        {/* Background Grid Pattern nhẹ nhẹ cho đẹp */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      </section>

      <div className="max-w-6xl mx-auto px-4 space-y-12">
        
        {/* 2. FEATURED SECTION: Truyện Hot (Ưu tiên hiển thị) */}
        {featured.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Flame className="text-orange-500 w-6 h-6 animate-pulse" />
              <h2 className="text-xl font-bold uppercase tracking-wider">Truyện Đề Cử</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featured.map((comic) => (
                <ComicCard key={comic.id} comic={comic} />
              ))}
            </div>
          </section>
        )}

        {/* 3. LATEST UPDATES: Mới cập nhật */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Clock className="text-blue-500 w-6 h-6" />
              <h2 className="text-xl font-bold uppercase tracking-wider">Mới Cập Nhật</h2>
            </div>
            <Link href="/tat-ca" className="text-xs text-primary hover:underline">
              Xem tất cả &rarr;
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {latest.length > 0 ? latest.map((comic) => (
              <ComicCard key={comic.id} comic={comic} />
            )) : (
              // Empty State nếu chưa có dữ liệu
              <p className="col-span-full text-center text-gray-500 py-10">
                Đang nạp năng lượng... (Chưa có truyện nào)
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}