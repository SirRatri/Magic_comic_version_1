'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  Search, Menu, X, Bell, User, 
  ChevronDown, BookOpen, Zap, 
  LayoutGrid, Compass, Flame, History 
} from 'lucide-react';

// --- 1. CONFIGURATION ---
const NAV_LINKS = [
  { name: 'Trang Chủ', href: '/', icon: LayoutGrid },
  { name: 'Thịnh Hành', href: '/thinh-hanh', icon: Flame },
  { name: 'Khám Phá', href: '/kham-pha', icon: Compass },
  { name: 'Mới Cập Nhật', href: '/moi-cap-nhat', icon: Zap },
];

export default function Header() {
  const pathname = usePathname();
  
  // --- 2. STATE MANAGEMENT ---
  const [isScrolled, setIsScrolled] = useState(false); // Trạng thái cuộn khỏi top
  const [isVisible, setIsVisible] = useState(true);    // Trạng thái ẩn/hiện khi cuộn
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lastRead, setLastRead] = useState<{ title: string, slug: string, chapter: string } | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Refs để xử lý logic cuộn thông minh
  const lastScrollY = useRef(0);

  // --- 3. SCROLL LOGIC & HISTORY LOADER ---
  useEffect(() => {
    // Load lịch sử đọc gần nhất từ LocalStorage
    const savedHistory = localStorage.getItem('last_read_session');
    if (savedHistory) {
      setLastRead(JSON.parse(savedHistory));
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // 1. Logic đổi màu nền khi rời khỏi Top
      setIsScrolled(currentScrollY > 50);

      // 2. Logic ẩn hiện thông minh (Dynamic Island behavior)
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        // Đang cuộn xuống -> Ẩn Header
        setIsVisible(false);
        setShowUserMenu(false); // Đóng menu con nếu đang mở
      } else {
        // Đang cuộn lên -> Hiện Header
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Đóng Mobile Menu khi chuyển trang
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);


  // --- 4. RENDER UI ---
  return (
    <>
      {/* HEADER CONTAINER 
         Sử dụng fixed positioning và transition transform để tạo hiệu ứng trượt 
      */}
      <header 
        className={`fixed top-0 inset-x-0 z-[100] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        } ${
          isScrolled 
            ? 'bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 shadow-glass' 
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          
          {/* --- LEFT: LOGO & BRANDING --- */}
          <div className="flex items-center gap-2 md:gap-8">
            {/* Mobile Menu Trigger */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white active:scale-95 transition-transform"
            >
              <Menu size={24} />
            </button>

            {/* Logo Chính */}
            <Link href="/" className="group flex items-center gap-2 relative">
              <div className="relative w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-primary to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-neon transition-all duration-300 group-hover:rotate-12">
                <BookOpen size={20} className="text-white" />
                {/* Ping Animation (Đèn báo online) */}
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-[#050505]"></span>
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg md:text-xl font-black text-white tracking-tight leading-none">
                  MAGIC<span className="text-primary">COMIC</span>
                </span>
                <span className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] group-hover:text-primary transition-colors">
                  Cyber Reader v2.0
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link 
                    key={link.name} 
                    href={link.href}
                    className={`relative px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all overflow-hidden group/nav ${
                      isActive ? 'text-white bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <link.icon size={16} className={`transition-colors ${isActive ? 'text-primary' : 'group-hover/nav:text-primary'}`} />
                    {link.name}
                    {/* Hiệu ứng gạch chân chạy chạy */}
                    <div className={`absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover/nav:w-full'}`} />
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* --- RIGHT: ACTIONS & USER --- */}
          <div className="flex items-center gap-2 md:gap-4">
            
            {/* 1. Quick Continue Reading (Hiện trên Desktop) */}
            {lastRead && (
              <Link 
                href={`/truyen/${lastRead.slug}/${lastRead.chapter}`}
                className="hidden lg:flex items-center gap-3 pr-4 pl-2 py-1.5 bg-[#121212] border border-white/10 rounded-full hover:border-primary/50 transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <History size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-500 uppercase font-bold">Đọc tiếp</span>
                  <span className="text-xs font-bold text-white max-w-[100px] truncate">{lastRead.title}</span>
                </div>
              </Link>
            )}

            {/* 2. Notification Bell */}
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#050505]"></span>
            </button>

            {/* 3. Search Trigger (Chỉ là icon, logic search bar nằm đè lên) */}
            {/* Lưu ý: Component SearchBar sẽ tự handle việc hiển thị, đây chỉ là visual placeholder nếu cần */}
            <div className="w-[1px] h-6 bg-white/10 mx-1 hidden md:block" />

            {/* 4. User Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-1 pr-1 md:pr-3 py-1 rounded-full border border-transparent hover:border-white/10 hover:bg-white/5 transition-all"
              >
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 p-[1px] overflow-hidden">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                     {/* Avatar giả lập */}
                     <User size={18} className="text-gray-400" />
                  </div>
                </div>
                <span className="hidden md:block text-sm font-bold text-white">Khách</span>
                <ChevronDown size={14} className="hidden md:block text-gray-500" />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl p-2 animate-in fade-in zoom-in-95 origin-top-right">
                  <div className="px-3 py-2 mb-2 border-b border-white/5">
                    <p className="text-sm font-bold text-white">Tài khoản Khách</p>
                    <p className="text-xs text-gray-500">Đăng nhập để lưu truyện</p>
                  </div>
                  {['Tủ truyện', 'Lịch sử', 'Cài đặt'].map((item) => (
                    <button key={item} className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
                      {item}
                    </button>
                  ))}
                  <div className="h-[1px] bg-white/5 my-1" />
                  <button className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-primary hover:bg-primary/10 transition-colors">
                    Đăng Nhập / Đăng Ký
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* --- MOBILE MENU OVERLAY (GIAO DIỆN MOBILE XỊN) --- 
      */}
      <div 
        className={`fixed inset-0 z-[101] md:hidden transition-all duration-500 ${
          isMobileMenuOpen ? 'visible' : 'invisible'
        }`}
      >
        {/* Backdrop mờ */}
        <div 
          className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-500 ${
             isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Drawer Content (Trượt từ trái sang) */}
        <div 
          className={`absolute top-0 left-0 w-[85%] h-full bg-[#0a0a0a] border-r border-white/10 shadow-2xl flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Mobile Header */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-white/5 bg-gradient-to-r from-primary/10 to-transparent">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-neon">
                 <BookOpen size={24} className="text-white" />
               </div>
               <span className="text-xl font-black text-white">MENU</span>
             </div>
             <button 
               onClick={() => setIsMobileMenuOpen(false)}
               className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white"
             >
               <X size={20} />
             </button>
          </div>

          {/* Mobile Links */}
          <div className="flex-1 overflow-y-auto p-6 space-y-2">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Khám phá</div>
            
            {NAV_LINKS.map((link) => (
              <Link 
                key={link.name}
                href={link.href}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-transparent active:border-primary/50 active:bg-primary/10 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center group-hover:text-primary transition-colors">
                  <link.icon size={20} />
                </div>
                <span className="text-base font-bold text-white">{link.name}</span>
                <div className="ml-auto">
                  <div className="w-2 h-2 rounded-full bg-white/10 group-hover:bg-primary transition-colors" />
                </div>
              </Link>
            ))}

            {/* User Actions Mobile */}
            <div className="mt-8 pt-8 border-t border-white/5">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Tài khoản</div>
              <button className="w-full flex items-center gap-4 p-4 rounded-2xl border border-dashed border-white/20 hover:border-primary hover:bg-primary/5 transition-all text-gray-400 hover:text-primary">
                 <User size={20} />
                 <span className="font-bold">Đăng nhập ngay</span>
              </button>
            </div>
          </div>

          {/* Mobile Footer */}
          <div className="p-6 bg-white/[0.02]">
            <div className="flex items-center justify-between text-xs text-gray-500">
               <span>v2.0.4 Stable</span>
               <span className="flex items-center gap-1">
                 <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> System Online
               </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}