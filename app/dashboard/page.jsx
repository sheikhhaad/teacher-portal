"use client";

import React, { useEffect } from "react";
import { BookOpen } from "lucide-react";
import CourseCard from "@/component/CourseCard";
import { useTeacher } from "@/app/context/AuthContext";
import { useCourse } from "@/app/context/CourseContext";
import { useQueries } from "@/app/context/QueryContext";
import LoadingComponent from "@/component/Loading";
import ErrorMessage from "@/component/Error";

export default function Home() {
  const {
    teacher,
    error: teacherError,
    loading: teacherLoading,
  } = useTeacher();

  const { course, error: courseError, loading: courseLoading } = useCourse();

  const { queries, fetchCourseQueries } = useQueries();

  useEffect(() => {
    if (!teacher || !course) return;

    fetchCourseQueries(course._id, teacher._id);
  }, [teacher, course]);

  if (teacherLoading || courseLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingComponent message="Loading your dashboard..." />
      </div>
    );
  }

  if (teacherError || courseError) {
    return (
      <div className="h-full flex items-center justify-center">
        <ErrorMessage message={teacherError || courseError} />
      </div>
    );
  }

  if (!teacher || !course) {
    return (
      <div className="h-full flex items-center justify-center">
        <ErrorMessage message="Unauthorized: No teacher or course loaded." />
      </div>
    );
  }

  const resolvedCount = queries.filter((q) => q.status === "resolved").length;

  const resolutionRate =
    queries.length > 0 ? Math.round((resolvedCount / queries.length) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 premium-panel bg-white p-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Welcome back,
            <span className="text-indigo-600"> {teacher.name}</span>
          </h1>

          <p className="text-gray-500 mt-1">
            Here's what's happening with your
            <span className="font-semibold text-gray-700">
              {" "}
              {course.name}
            </span>{" "}
            course today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-sm border border-indigo-100">
            {course.code}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <BookOpen size={24} className="text-indigo-600" />
              Course Overview
            </h2>
          </div>

          <CourseCard course={course} />
        </div>
      </div>
    </div>
  );
}
