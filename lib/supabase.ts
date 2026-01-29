import { createClient } from '@supabase/supabase-js';

// Lấy key từ biến môi trường (sẽ cài đặt trên Netlify sau)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Tạo client kết nối
export const supabase = createClient(supabaseUrl, supabaseKey);