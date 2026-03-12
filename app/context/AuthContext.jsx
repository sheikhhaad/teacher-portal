"use client";

import { createContext, useContext, useState, useEffect } from "react";
import api from "@/utils/api";
import { useRouter } from "next/navigation";

const TeacherContext = createContext();

export function TeacherProvider({ children }) {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        setError(null);

        const res = await api.get("/api/auth/teacher/me");

        setTeacher(res.data.teacher);
      } catch (err) {
        if (err.response?.status !== 401) {
          console.error("Teacher fetch error", err);
          setError("Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTeacher();
  }, []);

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
