"use client";

import { createContext, useContext, useState, useEffect } from "react";
import api from "@/utils/api";

const TeacherContext = createContext();

export function TeacherProvider({ children }) {
  const [teacher, setTeacher] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const storedTeacher = localStorage.getItem("course_id");
        if (storedTeacher) {
          const course_id = JSON.parse(storedTeacher);
          const res = await api.get(`/api/auth/teacher/${course_id}`);
          setTeacher(res.data.teacher); // teacher object with _id
        }
      } catch (err) {
        console.error("Failed to fetch teacher:", err);
        setError("Failed to load your profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchTeacher();
  }, []);

  return (
    <TeacherContext.Provider
      value={{ notifications, teacher, setTeacher, loading, error }}
    >
      {children}
    </TeacherContext.Provider>
  );
}

export function useTeacher() {
  const context = useContext(TeacherContext);
  if (!context)
    throw new Error("useTeacher must be used within a TeacherProvider");
  return context;
}
