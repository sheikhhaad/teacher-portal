"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/utils/api";

let CourseContext = createContext();

export const CourseProvider = ({ children }) => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const storedCourse = localStorage.getItem("course_id");
        if (storedCourse) {
          const course_id = JSON.parse(storedCourse);
          const res = await api.get(`/api/courses/${course_id}`);
          setCourse(res.data.course); // course object with _id
        }
      } catch (err) {
        console.error("Failed to fetch course:", err);
        setError("Failed to load course details.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, []);

  return (
    <CourseContext.Provider value={{ course, setCourse, loading, error }}>
      {children}
    </CourseContext.Provider>
  );
};

export function useCourse() {
  const context = useContext(CourseContext);
  if (!context)
    throw new Error("useCourse must be used within a CourseProvider");
  return context;
}
