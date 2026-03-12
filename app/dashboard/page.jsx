"use client";

import React, { useEffect } from "react";
import { BookOpen } from "lucide-react";
import CourseCard from "@/component/CourseCard";
import { useTeacher } from "@/app/context/AuthContext";
import { useCourse } from "@/app/context/CourseContext";
import { useQueries } from "@/app/context/QueryContext";
import LoadingComponent from "@/component/Loading";
import ErrorMessage from "@/component/Error";
import StatsCard from "@/component/StatsCard";
import { 
  CheckCircle2, 
  MessageSquare, 
  TrendingUp, 
  AlertCircle 
} from "lucide-react";

export default function Home() {
  const {
    teacher,
    error: teacherError,
    loading: teacherLoading,
  } = useTeacher();

  const { course, error: courseError, loading: courseLoading } = useCourse();

  const { queries, fetchCourseQueries } = useQueries();

  const isInitialLoading = teacherLoading || courseLoading;

  useEffect(() => {
    if (teacher?._id && course?._id) {
      fetchCourseQueries(course._id, teacher._id);
    }
  }, [teacher?._id, course?._id, fetchCourseQueries]);

  if (isInitialLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <LoadingComponent message="Preparing your dashboard..." />
      </div>
    );
  }

  if (teacherError || courseError) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <ErrorMessage message={teacherError || courseError || "Failed to load dashboard data."} />
      </div>
    );
  }

  if (!teacher || !course) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-amber-50 border border-amber-200 p-8 rounded-2xl max-w-md">
          <h2 className="text-xl font-bold text-amber-800 mb-2">Access Restricted</h2>
          <p className="text-amber-700">
            We couldn't verify your access or course details. Please try logging in again.
          </p>
          <button 
            onClick={() => window.location.href = '/auth/login'}
            className="mt-6 px-6 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const resolvedCount = (queries || []).filter((q) => q.status === "resolved").length;

  const resolutionRate =
    queries?.length > 0 ? Math.round((resolvedCount / queries.length) * 100) : 0;

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          icon={MessageSquare}
          label="Total Queries"
          value={queries?.length || 0}
          accent="#6366f1"
        />
        <StatsCard 
          icon={CheckCircle2}
          label="Resolved"
          value={resolvedCount}
          accent="#10b981"
        />
        <StatsCard 
          icon={TrendingUp}
          label="Res. Rate"
          value={`${resolutionRate}%`}
          accent="#f59e0b"
        />
        <StatsCard 
          icon={AlertCircle}
          label="Pending"
          value={(queries?.length || 0) - resolvedCount}
          accent="#f43f5e"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <BookOpen size={24} className="text-indigo-600" />
              Course Overview
            </h2>
          </div>

          <CourseCard course={course} />
        </div>
        
        {/* Right column for quick actions or more stats if needed */}
        <div className="space-y-4">
           {/* Placeholder for future components like Recent queries mini-list */}
        </div>
      </div>
    </div>
  );
}
