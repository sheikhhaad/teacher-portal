"use client";

import { createContext, useContext, useState, useEffect } from "react";
import api from "@/utils/api";
import { useRouter, usePathname } from "next/navigation";
import { useTeacher } from "./AuthContext";

const EnrollMentContext = createContext();

export function EnrollMentProvider({ children }) {
  const [enrollments, setEnrollments] = useState([]); // multi-enrollment support
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pathname = usePathname();
  const router = useRouter();
  const { teacher } = useTeacher();

  useEffect(() => {
    const fetchEnrollments = async () => {
      // Skip if teacher not available or on /auth routes
      if (!teacher?._id || pathname.startsWith("/auth")) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const res = await api.get(`/api/enrollments/teacher/all/${teacher._id}`);
      
        const allEnrollments = res.data?.teacherEnrollments || [];
        console.log(allEnrollments);
        
        
        // Filter enrollments for this teacher
        const teacherEnrollments = allEnrollments.filter(
          (enroll) => String(enroll.teacher_id) === String(teacher?._id)
        );

        setEnrollments(teacherEnrollments);
        setError(null);
      } catch (err) {
        console.error("Fetch enrollment failed:", err);
        setEnrollments([]);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [pathname, teacher?._id]);
console.log(enrollments);

  return (
    <EnrollMentContext.Provider
      value={{
        teacherEnrollments:enrollments,
        setEnrollments,
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
    throw new Error(
      "useEnrollMent must be used within EnrollMentProvider"
    );
  }

  return context;
}