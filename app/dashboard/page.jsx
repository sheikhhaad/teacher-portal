"use client";
import React, { useState } from "react";
import { BookOpen } from "lucide-react";
import CourseCard from "@/component/CourseCard";
import { useTeacher } from "@/app/context/AuthContext";
import { useCourse } from "@/app/context/CourseContext";
import LoadingComponent from "@/component/Loading";
import ErrorMessage from "@/component/Error";

export default function Home() {
  const {
    teacher,
    error: teacherError,
    loading: teacherLoading,
  } = useTeacher();
  const { course, error: courseError, loading: courseLoading } = useCourse();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (courseLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingComponent message="Loading your dashboard..." />
      </div>
    );
  }

  if (teacherError || courseError || error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage message={teacherError || courseError || error} />
      </div>
    );
  }

  if (!course || !teacher) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage message="Unauthorized: No teacher or course loaded." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Welcome back,{" "}
              <span className="text-indigo-600">{teacher.name}</span>!
            </h1>
            <p className="text-gray-500 mt-1">
              Here's what's happening with your{" "}
              <span className="font-semibold text-gray-700">{course.name}</span>{" "}
              course today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-sm border border-indigo-100">
              {course.code}
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Course Details Section */}
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
    </div>
  );
}
