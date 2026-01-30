"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, BookOpen, User, Search } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Trang chủ", href: "/", icon: Home },
    { name: "Khám phá", href: "/kham-pha", icon: Compass },
    { name: "Tìm kiếm", href: "/tim-kiem", icon: Search }, // Nút tìm kiếm to ở giữa
    { name: "Tủ truyện", href: "/tu-truyen", icon: BookOpen },
    { name: "Cá nhân", href: "/ca-nhan", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/5 pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`btn-bouncy flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? "text-[#ff4b1f]" : "text-gray-500"
              }`}
            >
              {/* Nút Tìm kiếm đặc biệt (To hơn, nằm giữa) */}
              {item.href === "/tim-kiem" ? (
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#ff4b1f] to-[#ff9068] flex items-center justify-center text-white shadow-lg shadow-orange-500/30 -mt-6 border-4 border-[#0a0a0a]">
                   <Icon size={24} strokeWidth={2.5} />
                </div>
              ) : (
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              )}
              
              {item.href !== "/tim-kiem" && (
                <span className="text-[10px] font-medium">{item.name}</span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}