"use client";

import { createContext, useContext, useState, useEffect } from "react";
import api from "@/utils/api";
import { useRouter, usePathname } from "next/navigation";

const TeacherContext = createContext();

export function TeacherProvider({ children }) {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchTeacher = async () => {
      if (pathname.startsWith("/auth")) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await api.get("api/auth/teacher/me");
        setTeacher(res.data.teacher);
        setError(null);
      } catch (err) {
        console.error("Fetch teacher failed:", err);
        setTeacher(null);
        // Only redirect if not already on login page and not just a network error
        if (err.response?.status === 401) {
          router.push("/auth/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTeacher();
  }, [pathname, router]);
  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (err) {
      console.error("Logout failed", err);
    }

    setTeacher(null);

    router.push("/auth/login");
  };

  return (
    <TeacherContext.Provider
      value={{
        teacher,
        setTeacher,
        loading,
        error,
        logout,
      }}
    >
      {children}
    </TeacherContext.Provider>
  );
}

export function useTeacher() {
  const context = useContext(TeacherContext);

  if (!context) {
    throw new Error("useTeacher must be used within TeacherProvider");
  }

  return context;
}
