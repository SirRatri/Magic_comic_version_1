// File: types.ts (hoặc types/index.ts)

export interface Comic {
  id: number;
  title: string;
  thumbnail: string;
  slug: string;
  author?: string;
  updated_at: string;
  
  // --- CÁC TRƯỜNG MỚI CHO GIAO DIỆN XỊN ---
  views?: number;       // Số lượt xem
  tags?: string[];      // Thể loại: ['Action', 'Manhwa']
  status?: string;      // Trạng thái: 'completed' | 'ongoing'
  description?: string; // Mô tả truyện
  rating?: number;      // Đánh giá sao (VD: 4.8)
}

export interface Chapter {
  id: number;
  title: string;
  slug: string;
  comic_id: number;
  images: string[];
  created_at: string;
}