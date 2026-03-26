"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Video,
  BookOpen,
  Settings,
  LogOut,
  Calendar,
  Bell,
} from "lucide-react";
import { useTeacher } from "@/app/context/AuthContext";

const SIDEBAR_LINKS = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  {
    name: "Course View",
    href: "/dashboard/course",
    icon: BookOpen,
    dynamic: true,
  },
  { name: "Meetings", href: "/dashboard/meetings", icon: Video },
  { name: "Slots", href: "/dashboard/slots", icon: Calendar },
  { name: "Annoucement", href: "/dashboard/annoucement", icon: Bell },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { teacher, logout } = useTeacher();

  // Simple active check
  const isActive = (href, dynamic) => {
    if (dynamic) {
      return pathname.startsWith("/dashboard/course");
    }
    return pathname === href;
  };

  return (
    <aside 
      className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 flex-col h-screen shrink-0 shadow-xl md:shadow-sm md:relative
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        flex
      `}
    >
      {/* Logo and Close Button */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-gray-50/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-600/20">
            T
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">
              Teacher
            </h1>
            <p className="text-[10px] font-semibold text-indigo-500 uppercase tracking-widest">
              Portal Pro
            </p>
          </div>
        </div>
        
        {/* Mobile Close Button */}
        <button 
          onClick={onClose}
          className="md:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        <div className="px-4 mb-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Main Menu
          </p>
        </div>

        {SIDEBAR_LINKS.map((link) => {
          let href = link.href;
          if (link.dynamic && teacher?.course_id) {
            href = `/dashboard/course/${teacher.course_id}`;
          }

          const active = isActive(link.href, link.dynamic);
          const Icon = link.icon;

          return (
            <Link
              key={link.name}
              href={href}
              onClick={() => {
                if (window.innerWidth < 768 && onClose) onClose();
              }}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-semibold transition-all duration-200 group ${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon
                size={20}
                className={`transition-colors ${active ? "text-indigo-600" : "text-gray-400 group-hover:text-indigo-500"}`}
              />
              {link.name}
            </Link>
          );
        })}
      </div>

      {/* Footer Profile / Logout */}
      <div className="px-4 py-6 border-t border-gray-50/50">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-semibold text-gray-600 hover:bg-red-50 hover:text-red-700 transition-colors group"
        >
          <LogOut
            size={20}
            className="text-gray-400 group-hover:text-red-500 transition-colors"
          />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
