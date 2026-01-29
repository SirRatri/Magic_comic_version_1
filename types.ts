export interface Comic {
  id: number;
  title: string;
  thumbnail: string;
  author: string;
  updated_at: string;
  slug: string;
}

export interface Chapter {
  id: number;
  comic_id: number;
  title: string;
  slug: string;
  images: string[];
  created_at: string; // <-- Dòng này quan trọng để fix lỗi
}