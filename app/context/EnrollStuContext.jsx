"use client";

import { createContext, useContext, useState, useEffect } from "react";
import api from "@/utils/api";
import { useRouter, usePathname } from "next/navigation";
import { useTeacher } from "./AuthContext";

const EnrollMentContext = createContext();

export function EnrollMentProvider({ children }) {
  const [enrollMent, setEnrollMent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pathname = usePathname();
  const router = useRouter();
  let { teacher } = useTeacher();

  useEffect(() => {
    const fetchEnrollMent = async () => {
      if (!teacher?.course_id) {
        setLoading(false);
        return;
      }

      if (pathname.startsWith("/auth")) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const res = await api.get(
          `/api/enrollments/course/${teacher.course_id}`,
        );

        setEnrollMent(res.data);
        setError(null);
      } catch (err) {
        console.error("Fetch enrollment failed:", err);
        setEnrollMent(null);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollMent();
  }, [pathname, teacher?.course_id]); // ✅ correct deps
  return (
    <EnrollMentContext.Provider
      value={{
        enrollMent,
        setEnrollMent,
        loading,
        error,
      }}
    >
      {children}
    </EnrollMentContext.Provider>
  );
}

export function useEnrollMent() {
  const context = useContext(EnrollMentContext);

  if (!context) {
    throw new Error("useEnrollMent must be used within EnrollMentProvider");
  }

  return context;
}
