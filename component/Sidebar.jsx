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
];

export default function Sidebar() {
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
    <aside className="w-72 bg-white border-r border-gray-100 flex-col h-screen sticky top-0 shrink-0 shadow-sm z-20 hidden md:flex">
      {/* Logo */}
      <div className="h-20 flex items-center px-8 border-b border-gray-50/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-600/20">
            T
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 leading-tight">
              Teacher
            </h1>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
              Portal Pro
            </p>
          </div>
        </div>
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
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all duration-200 group ${
                active
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
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
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors group"
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
