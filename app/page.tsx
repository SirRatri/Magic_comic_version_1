import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import ComicCard from '@/components/ComicCard';
import { Search, Flame, Clock, TrendingUp, Star, Zap, BookOpen, Crown, ChevronRight } from 'lucide-react';

// --- CONFIGURATION ---
// ISR: Cập nhật dữ liệu mới mỗi 60 giây (Công nghệ Static lai Dynamic)
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Magic Comic - Đọc Truyện Tranh Đỉnh Cao Công Nghệ',
  description: 'Nền tảng đọc truyện tranh bản quyền, tốc độ bàn thờ, giao diện Cyberpunk.',
};

// --- DATA FETCHING ENGINE (ĐỘNG CƠ XỬ LÝ DỮ LIỆU) ---
async function getHomePageData() {
  // Parallel Fetching: Chạy 3 luồng query cùng lúc thay vì chờ từng cái (Tối ưu Tốc độ)
  const [featured, latest, completed, stats] = await Promise.all([
    // 1. Lấy 5 truyện Hot nhất làm Banner & Đề cử
    supabase
      .from('comics')
      .select('*')
      .order('updated_at', { ascending: false }) // Tạm thời lấy mới nhất làm hot
      .limit(5),

    // 2. Lấy 12 truyện mới cập nhật
    supabase
      .from('comics')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(12),

    // 3. Lấy truyện đã hoàn thành (Ví dụ)
    supabase
      .from('comics')
      .select('*')
      .eq('status', 'completed') // Giả sử có cột status
      .limit(4),
      
    // 4. Fake số liệu thống kê (Hoặc query count thật nếu muốn)
    supabase.from('comics').select('id', { count: 'exact', head: true })
  ]);

  return {
    featured: featured.data || [],
    latest: latest.data || [],
    completed: completed.data || [],
    totalComics: stats.count || 999,
  };
}

// --- SUB-COMPONENTS (Chia nhỏ để code gọn và tái sử dụng) ---

// 1. HERO BANNER: Phần hiển thị hoành tráng nhất đầu trang
const HeroSection = ({ comic }: { comic: any }) => {
  if (!comic) return null;
  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden group">
      {/* Background Image (Mờ ảo) */}
      <div className="absolute inset-0">
        <Image
          src={comic.thumbnail}
          alt="Hero Background"
          fill
          className="object-cover opacity-30 scale-110 blur-xl group-hover:scale-125 transition-transform duration-[3s]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent" />
      </div>

      {/* Content chính */}
      <div className="relative h-full container mx-auto px-4 flex flex-col justify-end pb-16 md:pb-24 z-10">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/50 text-primary text-xs font-bold uppercase tracking-widest w-fit mb-4 animate-in-up">
          <Crown size={14} /> Spotlight
        </span>
        
        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight max-w-3xl text-shadow-neon animate-in-up" style={{ animationDelay: '0.1s' }}>
          {comic.title}
        </h1>
        
        <p className="text-gray-300 text-sm md:text-lg max-w-2xl line-clamp-2 mb-8 animate-in-up" style={{ animationDelay: '0.2s' }}>
          Một siêu phẩm truyện tranh với nét vẽ đỉnh cao. Theo dõi ngay hành trình của nhân vật chính trong thế giới đầy bí ẩn...
        </p>

        <div className="flex gap-4 animate-in-up" style={{ animationDelay: '0.3s' }}>
          <Link 
            href={`/truyen/${comic.slug}`} 
            className="btn-tech-primary shadow-neon group"
          >
            <BookOpen size={20} /> ĐỌC NGAY
          </Link>
          <button className="btn-tech-ghost backdrop-blur-md">
            <Star size={20} /> YÊU THÍCH
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. STATS BAR: Thanh thống kê nhìn cho "Ngầu"
const StatsBar = ({ total }: { total: number }) => (
  <div className="border-y border-white/5 bg-white/[0.02] backdrop-blur-sm">
    <div className="container mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-8">
      {[
        { label: 'Tổng số truyện', val: total + '+', icon: BookOpen, color: 'text-blue-500' },
        { label: 'Lượt đọc / ngày', val: '1.2M', icon: TrendingUp, color: 'text-green-500' },
        { label: 'Thành viên', val: '50K+', icon: Zap, color: 'text-yellow-500' },
        { label: 'Cập nhật', val: '24/7', icon: Clock, color: 'text-primary' },
      ].map((item, idx) => (
        <div key={idx} className="flex items-center gap-4 justify-center md:justify-start">
          <div className={`p-3 rounded-xl bg-white/5 ${item.color}`}>
            <item.icon size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{item.val}</div>
            <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">{item.label}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// 3. SECTION HEADER: Tiêu đề các mục
const SectionHeader = ({ title, icon: Icon, href }: { title: string, icon: any, href?: string }) => (
  <div className="flex items-end justify-between mb-8 border-b border-white/10 pb-4">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-primary/10 text-primary">
        <Icon size={24} />
      </div>
      <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
        {title}
      </h2>
    </div>
    {href && (
      <Link href={href} className="text-sm font-bold text-gray-500 hover:text-primary transition-colors flex items-center gap-1">
        XEM TẤT CẢ <ChevronRight size={16} />
      </Link>
    )}
  </div>
);

// --- MAIN PAGE COMPONENT ---
export default async function Home() {
  const data = await getHomePageData();
  const heroComic = data.featured[0]; // Lấy truyện đầu tiên làm Hero

  return (
    <main className="min-h-screen bg-[#050505] selection:bg-primary selection:text-white pb-20">
      
      {/* 1. HERO SECTION */}
      <HeroSection comic={heroComic} />

      {/* 2. STATS DASHBOARD */}
      <StatsBar total={data.totalComics} />

      {/* 3. SEARCH & FILTER (Giao diện giả lập) */}
      <div className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 shadow-glass">
        <div className="container mx-auto px-4 py-4">
          <div className="relative group max-w-2xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative flex items-center bg-[#121212] border border-white/10 rounded-xl overflow-hidden focus-within:border-primary/50 transition-colors">
              <div className="pl-4 text-gray-400">
                <Search size={20} />
              </div>
              <input 
                type="text" 
                placeholder="Tìm kiếm truyện, tác giả, thể loại..." 
                className="w-full bg-transparent border-none px-4 py-3 text-white placeholder-gray-500 focus:outline-none"
              />
              <button className="px-6 py-2 bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 border-l border-white/10 transition-colors">
                LỌC NÂNG CAO
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 space-y-20 mt-12">
        
        {/* 4. FEATURED / TRUYỆN ĐỀ CỬ */}
        <section>
          <SectionHeader title="Đề Cử Hot" icon={Flame} />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {data.featured.map((comic) => (
              <ComicCard key={comic.id} comic={comic} />
            ))}
          </div>
        </section>

        {/* 5. LATEST UPDATES / MỚI CẬP NHẬT */}
        <section className="relative">
          {/* Background decoration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
          
          <SectionHeader title="Mới Cập Nhật" icon={Zap} href="/moi-cap-nhat" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-8">
            {data.latest.map((comic) => (
              <ComicCard key={comic.id} comic={comic} />
            ))}
          </div>
          
          <div className="mt-12 text-center">
             <button className="btn-tech-ghost mx-auto px-12">
               XEM THÊM 20 TRUYỆN KHÁC
             </button>
          </div>
        </section>

        {/* 6. GENRES / THỂ LOẠI (Pills UI) */}
        <section className="py-12 border-y border-white/5 bg-white/[0.01]">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">KHÁM PHÁ THỂ LOẠI</h2>
            <p className="text-gray-500 text-sm">Tìm kiếm câu chuyện phù hợp với gu của bạn</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {['Action', 'Adventure', 'Chuyển Sinh', 'Cổ Đại', 'Comedy', 'Drama', 'Fantasy', 'Manhua', 'Manhwa', 'Ngôn Tình', 'School Life', 'Xuyên Không'].map((genre) => (
              <Link 
                key={genre} 
                href={`/the-loai/${genre}`}
                className="px-6 py-2 rounded-full border border-white/10 bg-[#121212] text-gray-400 text-sm font-medium hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
              >
                {genre}
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* 7. FOOTER (Phần chân trang hoành tráng) */}
      <footer className="mt-20 border-t border-white/5 bg-[#0a0a0a] pt-16 pb-8">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">
              MAGIC COMIC
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Nền tảng đọc truyện tranh thế hệ mới. Tối ưu hóa trải nghiệm người dùng với tốc độ tải trang nhanh nhất và giao diện Cyberpunk độc đáo.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">LIÊN KẾT</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="#" className="hover:text-primary">Về chúng tôi</Link></li>
              <li><Link href="#" className="hover:text-primary">Chính sách bảo mật</Link></li>
              <li><Link href="#" className="hover:text-primary">Điều khoản dịch vụ</Link></li>
              <li><Link href="#" className="hover:text-primary">DMCA</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">KẾT NỐI</h4>
            <div className="flex gap-4">
              {/* Fake Social Icons */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-colors cursor-pointer">
                  <div className="w-4 h-4 bg-current rounded-sm" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 pt-8 border-t border-white/5 text-center text-xs text-gray-600">
          &copy; 2026 Magic Comic Inc. Designed for Speed & Beauty.
        </div>
      </footer>

      {/* 8. JSON-LD SCHEMA FOR SEO (Vũ khí bí mật cho Google) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Magic Comic',
            url: 'https://magic-comic.com',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://magic-comic.com/tim-kiem?q={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />
    </main>
  );
}