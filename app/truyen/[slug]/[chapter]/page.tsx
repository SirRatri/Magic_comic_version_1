import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ChapterImage from '@/components/ChapterImage';
import { ArrowLeft, ArrowRight, Home, Menu } from 'lucide-react';

export const revalidate = 60; // Cache 60s để giảm tải DB

export default async function ReadChapter({ params }: { params: { slug: string, chapter: string } }) {
  // 1. Lấy dữ liệu chương hiện tại
  const { data: chapter } = await supabase
    .from('chapters')
    .select('*, comics(title, slug)') // Lấy luôn tên truyện để làm breadcrumb
    .eq('slug', params.chapter)
    .eq('comics.slug', params.slug) // Đảm bảo chương thuộc đúng truyện
    .single();

  if (!chapter) return notFound();

  // 2. Lấy danh sách tất cả các chương để tính toán nút Next/Prev
  // (Chỉ lấy slug và id để nhẹ query)
  const { data: allChapters } = await supabase
    .from('chapters')
    .select('slug, id')
    .eq('comic_id', chapter.comic_id)
    .order('id', { ascending: true }); // Sắp xếp từ chap 1 -> mới nhất

  const currentIndex = allChapters?.findIndex(c => c.id === chapter.id) ?? -1;
  const prevChapter = currentIndex > 0 ? allChapters?.[currentIndex - 1] : null;
  const nextChapter = currentIndex < (allChapters?.length ?? 0) - 1 ? allChapters?.[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      {/* THANH ĐIỀU HƯỚNG TRÊN CÙNG (Sticky) */}
      <div className="fixed top-0 inset-x-0 z-50 bg-[#121212]/95 backdrop-blur-md border-b border-gray-800 h-14 flex items-center justify-between px-4 shadow-lg">
        <Link href={`/truyen/${params.slug}`} className="p-2 -ml-2 text-gray-400 hover:text-white">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        
        <div className="flex flex-col text-center">
          <h1 className="text-xs font-bold text-gray-500 uppercase tracking-wider max-w-[200px] truncate">
            {/* @ts-ignore - Supabase type join hơi lằng nhằng, bỏ qua check type chỗ này cho nhanh */}
            {chapter.comics?.title}
          </h1>
          <span className="text-sm font-bold text-white truncate">{chapter.title}</span>
        </div>

        <Link href="/" className="p-2 -mr-2 text-gray-400 hover:text-primary">
          <Home className="w-5 h-5" />
        </Link>
      </div>

      {/* KHUNG HIỂN THỊ ẢNH TRUYỆN */}
      <div className="pt-14 max-w-3xl mx-auto bg-black min-h-screen">
        {chapter.images && chapter.images.length > 0 ? (
          chapter.images.map((img: string, idx: number) => (
            <ChapterImage key={idx} src={img} alt={`${chapter.title} - trang ${idx + 1}`} />
          ))
        ) : (
          <div className="py-20 text-center text-gray-500">
            <p>Đang tải ảnh hoặc chương bị lỗi...</p>
          </div>
        )}
      </div>

      {/* THANH ĐIỀU HƯỚNG DƯỚI CÙNG (Next/Prev) */}
      <div className="fixed bottom-0 inset-x-0 bg-[#121212] border-t border-gray-800 p-3 z-50">
        <div className="max-w-3xl mx-auto flex justify-between gap-3">
          {/* Nút Chương Trước */}
          <Link
            href={prevChapter ? `/truyen/${params.slug}/${prevChapter.slug}` : '#'}
            className={`flex-1 flex items-center justify-center py-3 rounded-lg font-bold text-sm transition-colors ${
              prevChapter 
                ? 'bg-gray-800 text-white hover:bg-gray-700' 
                : 'bg-gray-900 text-gray-600 cursor-not-allowed'
            }`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Trước
          </Link>

          {/* Nút Danh sách */}
          <Link 
             href={`/truyen/${params.slug}`}
             className="px-4 flex items-center justify-center bg-gray-800 rounded-lg text-gray-400 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </Link>

          {/* Nút Chương Sau */}
          <Link
            href={nextChapter ? `/truyen/${params.slug}/${nextChapter.slug}` : '#'}
            className={`flex-1 flex items-center justify-center py-3 rounded-lg font-bold text-sm transition-colors ${
              nextChapter
                ? 'bg-primary text-white hover:bg-orange-600'
                : 'bg-gray-900 text-gray-600 cursor-not-allowed'
            }`}
          >
            Sau <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}