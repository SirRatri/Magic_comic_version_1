'use client';

import Link from 'next/link';
import { Ghost, Menu, User } from 'lucide-react';
import SearchBar from './SearchBar';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#121212]/90 backdrop-blur-md border-b border-gray-800 h-16 transition-all">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-4">
        {/* 1. LOGO */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-primary rounded-lg group-hover:rotate-12 transition-transform">
            <Ghost className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tighter hidden sm:block">
            Magic<span className="text-primary">Comic</span>
          </span>
        </Link>

        {/* 2. THANH TÌM KIẾM (Đã làm ở bước trước) */}
        <div className="flex-1 max-w-xl">
           <SearchBar />
        </div>

        {/* 3. MENU USER (Tạm thời để nút Login) */}
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-gray-800 rounded-full transition-colors md:hidden">
            <Menu className="w-6 h-6" />
          </button>
          <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-full text-sm font-medium transition-all">
            <User className="w-4 h-4" />
            <span>Đăng nhập</span>
          </button>
        </div>
      </div>
    </header>
  );
}