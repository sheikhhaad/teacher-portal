"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/utils/api";
import { useTeacher } from "./AuthContext";

const CourseContext = createContext();

export const CourseProvider = ({ children }) => {
  const [courses, setCourses] = useState([]); // teacher ke saare courses
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { teacher } = useTeacher();

  useEffect(() => {
    if (!teacher?._id) return;

    const fetchCourses = async () => {
      try {
        setLoading(true);

        // Fetch all courses
        const coursesRes = await api.get("/api/courses/all");
        const allCoursesRaw = coursesRes.data?.courses || coursesRes.data;
        const allCourses = Array.isArray(allCoursesRaw) ? allCoursesRaw : [];
        console.log("All courses:", allCourses);

        // Fetch all enrollments
        const enrollmentRes = await api.get("/api/enrollments/teacher/all");
        const allEnrollmentsRaw =
          enrollmentRes.data?.teacherEnrollments || enrollmentRes.data;
        const allEnrollments = Array.isArray(allEnrollmentsRaw)
          ? allEnrollmentsRaw
          : [];
        console.log("All enrollments:", allEnrollments);

        // Filter enrollments for this teacher
        const teacherEnrollments = allEnrollments.filter(
          (enroll) => String(enroll.teacher_id) === String(teacher._id)
        );
        console.log("Teacher enrollments:", teacherEnrollments);

        // Map teacher's enrollments to actual courses
        const matchedCourses = teacherEnrollments
          .map((enroll) =>
            allCourses.find(
              (course) => String(course._id) === String(enroll.course_id)
            )
          )
          .filter(Boolean); // remove nulls
        console.log("Matched courses:", matchedCourses);

        setCourses(matchedCourses);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        setError("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [teacher]);
  return (
    <CourseContext.Provider value={{ courses, setCourses, loading, error }}>
      {children}
    </CourseContext.Provider>
  );
};

export function useCourse() {
  const context = useContext(CourseContext);
  if (!context)
    throw new Error("useCourse must be used within CourseProvider");
  return context;
}