"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { Bell, Search, Menu, LogOut } from "lucide-react";
import { useTeacher } from "@/app/context/AuthContext";

export default function Topbar({ onMenuClick }) {
  const pathname = usePathname();
  const { teacher, logout } = useTeacher();

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
        <h2 className="text-xl font-black text-gray-800 tracking-tight">
          {getPageTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">


        <button onClick={logout} className="relative p-2.5 text-gray-400 hover:bg-gray-50 rounded-full transition-colors">
          <LogOut size={20} />
          <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
        </button>

        <div className="hidden sm:flex items-center gap-3 pl-6 border-l border-gray-200">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-900 leading-none">
              {teacher?.name || "Teacher"}
            </p>
            <p className="text-xs font-semibold text-gray-500 mt-1">
              Instructor
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-indigo-600 font-bold overflow-hidden shadow-sm">
            {teacher?.name?.charAt(0) || "T"}
          </div>
        </div>
      </div>
    </header>
  );
}
