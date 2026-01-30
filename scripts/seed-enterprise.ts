/**
 * MAGIC COMIC ENTERPRISE SEEDER v6.0 (NO-BLOCK EDITION)
 * Nguồn ảnh: Public CDN & High Quality Placeholders
 * Mục tiêu: Test giao diện cuộn, load ảnh mượt mà, không lỗi 403
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker/locale/vi';
import { v4 as uuidv4 } from 'uuid';
import cliProgress from 'cli-progress';
import colors from 'colors';

// 1. CẤU HÌNH HỆ THỐNG
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Dùng Service Role Key để có quyền ghi đè mọi thứ
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(colors.red('❌ LỖI: Thiếu biến môi trường. Kiểm tra file .env.local'));
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// --- CẤU HÌNH DỮ LIỆU ---
const CONFIG = {
  USER_COUNT: 30,          // Tạo 30 user
  COMIC_COUNT: 50,         // Tạo 50 bộ truyện
  MAX_CHAPTERS: 100,       // Max 100 chương/truyện
};

const GENRES = [
  "Action", "Adventure", "Chuyển Sinh", "Tu Tiên", "Hệ Thống", "Manhwa", "Manhua", 
  "Ecchi", "Harem", "School Life", "Drama", "Fantasy", "Martial Arts"
];

// --- KHO ẢNH BẤT TỬ (Direct Link từ các nguồn mở, không bị chặn) ---
const COVERS_POOL = [
  // Ảnh bìa phong cách Dark/Action
  "https://images.unsplash.com/photo-1612152605347-f93296cb657d?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1542259681-d4cd71886103?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1519638399535-1b036603ac77?auto=format&fit=crop&w=600&q=80",
  // Ảnh Anime Style
  "https://images.unsplash.com/photo-1560972550-aba3456b5564?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1620336655052-b57986f5a26a?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1558679918-ec9298c7678e?auto=format&fit=crop&w=600&q=80"
];

// Ảnh trang truyện (Dài dọc để test cuộn)
const PAGE_IMAGES = [
  "https://images.unsplash.com/photo-1614726365723-49cfae968169?auto=format&fit=crop&w=800&q=80", // Cyberpunk city
  "https://images.unsplash.com/photo-1618609377864-68609b857e90?auto=format&fit=crop&w=800&q=80", // Abstract dark
  "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80", // Neon
  "https://images.unsplash.com/photo-1515462277126-2dd0c162007a?auto=format&fit=crop&w=800&q=80"  // Retro
];

// --- HELPER FUNCTIONS ---
const slugify = (text: string) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + `-${Math.floor(Math.random() * 9999)}`;
const weightedRandom = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

class EnterpriseSeeder {
  private userIds: string[] = [];
  private comicIds: number[] = [];
  private bar = new cliProgress.SingleBar({
    format: colors.cyan('{bar}') + ' | {percentage}% | {value}/{total} | {msg}',
    hideCursor: true
  });

  async run() {
    console.clear();
    console.log(colors.bgMagenta.white.bold(' 🚀  MAGIC COMIC SEEDER - NO BLOCK EDITION  '));
    
    // 1. XÓA DỮ LIỆU CŨ (Để test cho sạch)
    console.log(colors.yellow('\n🧹 Đang dọn dẹp dữ liệu cũ (Reset Database)...'));
    await supabase.from('reading_history').delete().neq('id', 0);
    await supabase.from('comments').delete().neq('id', 0);
    await supabase.from('chapters').delete().neq('id', 0);
    await supabase.from('comics').delete().neq('id', 0);
    await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Xóa user ảo

    // 2. TẠO USER
    console.log(colors.green('\n👥 Đang tạo User giả lập...'));
    const users = [];
    for (let i = 0; i < CONFIG.USER_COUNT; i++) {
      const id = uuidv4();
      this.userIds.push(id);
      users.push({
        id, email: faker.internet.email(), full_name: faker.person.fullName(),
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`, // Avatar hoạt hình random
        role: 'user', coins: weightedRandom(0, 5000)
      });
    }
    await supabase.from('profiles').insert(users);

    // 3. TẠO COMIC
    console.log(colors.green(`\n📚 Đang nhập kho ${CONFIG.COMIC_COUNT} bộ truyện...`));
    const comics = [];
    for (let i = 0; i < CONFIG.COMIC_COUNT; i++) {
      const title = `${faker.word.adjective()} ${faker.word.noun()} ${faker.helpers.arrayElement(['Vô Địch', 'Tu Tiên', 'Online', 'Chi Vương'])}`;
      comics.push({
        title: title.charAt(0).toUpperCase() + title.slice(1),
        slug: slugify(title),
        thumbnail: faker.helpers.arrayElement(COVERS_POOL),
        author: faker.person.fullName(),
        description: faker.lorem.paragraphs(2),
        views: weightedRandom(10000, 1000000), // Hack view cao
        rating: faker.number.float({ min: 3.5, max: 5 }),
        status: Math.random() > 0.5 ? 'ongoing' : 'completed',
        tags: faker.helpers.arrayElements(GENRES, { min: 2, max: 4 }),
        updated_at: new Date().toISOString()
      });
    }
    const { data: comicData } = await supabase.from('comics').insert(comics).select('id');
    if (comicData) this.comicIds = comicData.map(c => c.id);

    // 4. TẠO CHAPTER & ẢNH TRUYỆN
    console.log(colors.green('\n📄 Đang in ấn Chapter (Công đoạn nặng nhất)...'));
    this.bar.start(this.comicIds.length, 0, { msg: 'Processing Comics' });
    
    for (const comicId of this.comicIds) {
      const numChapters = weightedRandom(10, CONFIG.MAX_CHAPTERS);
      const chapters = [];
      
      for (let c = 1; c <= numChapters; c++) {
        chapters.push({
          comic_id: comicId,
          title: `Chapter ${c}`,
          slug: `chapter-${c}`,
          views: weightedRandom(100, 50000),
          // Giả lập 10 trang truyện mỗi chap
          images: Array(10).fill(null).map(() => faker.helpers.arrayElement(PAGE_IMAGES)),
          created_at: faker.date.recent({ days: 30 }).toISOString()
        });
      }
      
      // Chia nhỏ insert để không bị lỗi
      const CHUNK = 50;
      for (let k = 0; k < chapters.length; k += CHUNK) {
         await supabase.from('chapters').insert(chapters.slice(k, k + CHUNK));
      }
      this.bar.increment();
    }
    this.bar.stop();

    console.log(colors.bgGreen.white.bold('\n ✅ HOÀN TẤT! ĐẠI CA F5 LẠI WEB LÀ NÉT CĂNG! '));
    process.exit(0);
  }
}

new EnterpriseSeeder().run();