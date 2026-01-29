import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import ChapterViewer from '@/components/ChapterViewer';

// Cache 60s để giảm tải server
export const revalidate = 60;

// Hàm chính của trang (Server Component)
export default async function ReadChapterPage({ params }: { params: { slug: string, chapter: string } }) {
  
  // 1. Lấy dữ liệu chương hiện tại
  const { data: chapter } = await supabase
    .from('chapters')
    .select('*, comics(title, slug)')
    .eq('slug', params.chapter)
    .eq('comics.slug', params.slug)
    .single();

  if (!chapter) return notFound();

  // 2. Lấy danh sách chương để tính nút Trước/Sau
  const { data: allChapters } = await supabase
    .from('chapters')
    .select('slug, id')
    .eq('comic_id', chapter.comic_id)
    .order('id', { ascending: true });

  const currentIndex = allChapters?.findIndex(c => c.id === chapter.id) ?? -1;
  const prevChapter = currentIndex > 0 ? allChapters?.[currentIndex - 1] : null;
  const nextChapter = currentIndex < (allChapters?.length ?? 0) - 1 ? allChapters?.[currentIndex + 1] : null;

  // 3. Trả về giao diện (ChapterViewer lo phần hiển thị)
  return (
    <div className="min-h-screen bg-[#050505]">
      <ChapterViewer 
        images={chapter.images} 
        chapterId={chapter.id}
        nextChapterSlug={nextChapter ? nextChapter.slug : null}
      />
    </div>
  );
}