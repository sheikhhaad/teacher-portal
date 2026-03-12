"use client";
import React, { useEffect } from "react";
import Sidebar from "@/component/Sidebar";
import Topbar from "@/component/Topbar";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const isMainDashboard = pathname === "/dashboard";

  return (
    <div className="flex h-screen bg-[#f7f7fb] overflow-hidden">
      {!isMainDashboard && <Sidebar />}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Topbar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
