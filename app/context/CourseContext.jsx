"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/utils/api";
import { useTeacher } from "./AuthContext";

const CourseContext = createContext();

export const CourseProvider = ({ children }) => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { teacher } = useTeacher();

  const course_id = teacher?.course_id;

  useEffect(() => {
    if (!course_id) return;

    const fetchCourse = async () => {
      try {
        setLoading(true);

        const res = await api.get(`/api/courses/${course_id}`);

        setCourse(res.data.course);
      } catch (err) {
        console.error("Failed to fetch course:", err);
        setError("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [course_id]);

  return (
    <CourseContext.Provider value={{ course, setCourse, loading, error }}>
      {children}
    </CourseContext.Provider>
  );
};

export function useCourse() {
  const context = useContext(CourseContext);

  if (!context) {
    throw new Error("useCourse must be used within CourseProvider");
  }

  return context;
}
