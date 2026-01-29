import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, BookOpen, Clock, List } from 'lucide-react';
import { Comic, Chapter } from '@/types';

// Cứ 60s sẽ làm mới dữ liệu 1 lần (để hứng chương mới từ tool leech)
export const revalidate = 60;

export default async function ComicDetail({ params }: { params: { slug: string } }) {
  // 1. Lấy thông tin truyện + Danh sách chương cùng lúc (Join bảng)
  const { data: comic } = await supabase
    .from('comics')
    .select(`
      *,
      chapters (
        id, title, slug, created_at
      )
    `)
    .eq('slug', params.slug)
    .single();

  // Nếu không tìm thấy truyện (do tool chưa leech xong hoặc sai link) -> Trả về 404
  if (!comic) {
    return notFound();
  }

  // Sắp xếp chương mới nhất lên đầu
  const chapters = (comic.chapters as Chapter[]).sort((a, b) => b.id - a.id);

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-4 py-6 animate-in fade-in duration-500">
      {/* Nút quay lại */}
      <Link href="/" className="inline-flex items-center text-gray-400 hover:text-primary mb-6 transition-colors text-sm font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" /> Trang chủ
      </Link>
      
      {/* KHỐI THÔNG TIN TRUYỆN */}
      <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-800 shadow-xl mb-8 flex flex-col md:flex-row gap-8">
        {/* Ảnh bìa */}
        <div className="relative w-48 h-72 flex-shrink-0 mx-auto md:mx-0 rounded-lg overflow-hidden shadow-2xl">
           <Image
            src={comic.thumbnail}
            alt={comic.title}
            fill
            className="object-cover"
            priority // Ảnh bìa tải ưu tiên
            sizes="(max-width: 768px) 100vw, 300px"
          />
        </div>

        {/* Thông tin chữ */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            {comic.title}
          </h1>
          <p className="text-primary font-medium mb-4 flex items-center justify-center md:justify-start gap-2">
            <span className="bg-primary/10 px-3 py-1 rounded-full text-xs uppercase tracking-wider">Tác giả: {comic.author}</span>
          </p>
          
          {/* Nút đọc ngay chương đầu tiên (nếu có) */}
          {chapters.length > 0 ? (
            <Link 
              href={`/truyen/${params.slug}/${chapters[chapters.length - 1].slug}`} // Chương cũ nhất (Chapter 1)
              className="inline-flex items-center bg-primary hover:bg-orange-600 text-white px-8 py-3 rounded-full font-bold transition-transform active:scale-95 shadow-lg shadow-primary/20"
            >
              <BookOpen className="w-5 h-5 mr-2" /> Đọc Ngay
            </Link>
          ) : (
            <p className="text-yellow-500 text-sm">Đang cập nhật chương...</p>
          )}
        </div>
      </div>

      {/* DANH SÁCH CHƯƠNG */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-800 pb-2">
          <List className="text-primary w-5 h-5" />
          <h3 className="text-lg font-bold">Danh sách chương ({chapters.length})</h3>
        </div>

        <div className="grid gap-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {chapters.map((chap) => (
            <Link 
              key={chap.id} 
              href={`/truyen/${params.slug}/${chap.slug}`}
              className="p-4 bg-[#1f1f1f] border border-gray-800 rounded-xl hover:border-primary/50 hover:bg-[#252525] flex justify-between items-center transition-all group"
            >
              <span className="font-medium text-gray-300 group-hover:text-white transition-colors">{chap.title}</span>
              <div className="flex items-center text-xs text-gray-500 gap-1">
                <Clock className="w-3 h-3" />
                {new Date(chap.created_at || '').toLocaleDateString('vi-VN')}
              </div>
            </Link>
          ))}
          {chapters.length === 0 && (
            <div className="text-center text-gray-500 py-10 italic">
              Chưa có chương nào. Tool đang chạy...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}