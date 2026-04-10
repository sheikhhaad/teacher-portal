"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { Bell, Search, Menu, LogOut, User, LayoutDashboard, ChevronDown } from "lucide-react";
import { useTeacher } from "@/app/context/AuthContext";
import NotificationBell from "./NotificationBell";
import Link from "next/link";

export default function Topbar({ onMenuClick }) {
  const pathname = usePathname();
  const { teacher, logout } = useTeacher();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper to get a nice title based on route
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Overview";
    if (pathname.includes("/course/")) return "Course View";
    if (pathname.includes("/meetings")) return "Live Meetings";
    return "Dashboard";
  };

  return (
    <header className="h-20 px-4 sm:px-6 lg:px-10 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 shrink-0">
      <div className="flex items-center gap-4">
        {/* Mobile menu button (would trigger a drawer in production) */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-gray-400 hover:bg-gray-50 rounded-xl"
        >
          <Menu size={24} />
        </button>
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">
          {getPageTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell />

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 pl-4 border-l border-gray-200 group hover:bg-gray-50/50 py-1.5 px-2 rounded-2xl transition-all"
          >
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-gray-900 leading-none">
                {teacher?.name || "Teacher"}
              </p>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">
                Instructor
              </p>
            </div>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold overflow-hidden shadow-sm group-hover:shadow-md transition-all">
                <img src={teacher?.profilePic} alt="" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                <ChevronDown size={10} className={`text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-3xl shadow-2xl shadow-indigo-100/50 overflow-hidden z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
              <div className="p-4 border-b border-gray-50 bg-indigo-50/10">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Signed in as</p>
                <p className="text-sm font-bold text-gray-900 truncate">{teacher?.email || "teacher@example.com"}</p>
              </div>
              
              <div className="p-2">
                <Link 
                  href="/dashboard/profile" 
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-indigo-600 shadow-sm transition-all border border-transparent group-hover:border-indigo-100">
                    <User size={16} />
                  </div>
                  My Profile
                </Link>
                
                <Link 
                  href="/dashboard" 
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-indigo-600 shadow-sm transition-all border border-transparent group-hover:border-indigo-100">
                    <LayoutDashboard size={16} />
                  </div>
                  Dashboard
                </Link>
                
                <div className="my-2 border-t border-gray-50" />
                
                <button 
                  onClick={() => {
                    logout();
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-2xl transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-400 group-hover:bg-white group-hover:text-rose-600 shadow-sm transition-all border border-transparent group-hover:border-rose-100">
                    <LogOut size={16} />
                  </div>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
