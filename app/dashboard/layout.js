"use client";
import React, { useEffect } from "react";
import Sidebar from "@/component/Sidebar";
import Topbar from "@/component/Topbar";
import { useTeacher } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import Loading from "@/component/Loading";

export default function DashboardLayout({ children }) {
  const { teacher, loading } = useTeacher();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !teacher) {
      router.push("/auth/login");
    }
  }, [teacher, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f7f7fb]">
        <Loading message="Verifying session..." />
      </div>
    );
  }

  if (!teacher) {
    return null; // or a redirecting message
  }

  return (
    <div className="flex h-screen bg-[#f7f7fb] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Topbar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
