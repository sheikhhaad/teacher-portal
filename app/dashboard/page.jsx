"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Users,
  MessageSquare,
  TrendingUp,
  Calendar,
} from "lucide-react";
import CourseCard from "@/component/CourseCard";
import { useTeacher } from "@/app/context/AuthContext";
import { useCourse } from "@/app/context/CourseContext";
import { useEnrollMent } from "../context/EnrollStuContext";
import api from "@/utils/api";

export default function Home() {
  const router = useRouter();
  const {
    teacher,
    error: teacherError,
    loading: teacherLoading,
  } = useTeacher();
  const { courses, error: courseError, loading: courseLoading } = useCourse();
  const { teacherEnrollments } = useEnrollMent();

  const [courseStudentsMap, setCourseStudentsMap] = useState({});
  const [loadingStudents, setLoadingStudents] = useState(false);

  const isLoading = teacherLoading || courseLoading || loadingStudents;

  // Fetch students for each course
  useEffect(() => {
    const fetchStudentsForCourses = async () => {
      if (!teacherEnrollments?.length) {
        setCourseStudentsMap({});
        return;
      }

      setLoadingStudents(true);
      const studentsData = {};
      const allStudentIds = new Set();

      await Promise.all(
        teacherEnrollments.map(async (enrollment) => {
          try {
            const res = await api.get(
              `/api/enrollments/course/${enrollment.course_id}`,
            );
            let courseStudents = [];
            if (res.data?.students) courseStudents = res.data.students;
            else if (res.data?.enrollments)
              courseStudents = res.data.enrollments;
            else if (Array.isArray(res.data)) courseStudents = res.data;
            else if (res.data?.data) courseStudents = res.data.data;

            studentsData[enrollment.course_id] = courseStudents;
            courseStudents.forEach(
              (student) => student?._id && allStudentIds.add(student._id),
            );
          } catch (err) {
            console.error(
              `Error fetching students for course ${enrollment.course_id}:`,
              err,
            );
            studentsData[enrollment.course_id] = [];
          }
        }),
      );

      setCourseStudentsMap(studentsData);
      setLoadingStudents(false);
    };

    fetchStudentsForCourses();
  }, [teacherEnrollments]);

  // Error state
  if (teacherError || courseError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center max-w-md w-full">
          <p className="text-rose-700 font-medium">
            {teacherError || courseError || "Failed to load data."}
          </p>
          <button
            onClick={() => router.refresh()}
            className="mt-5 px-5 py-2.5 bg-rose-100 text-rose-700 rounded-xl text-sm font-semibold hover:bg-rose-200 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-slate-200 border-t-slate-800 mx-auto" />
          <p className="mt-4 text-slate-500 text-sm font-medium">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // No teacher or courses
  if (!teacher || !courses?.length) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center max-w-md w-full">
          <h2 className="text-xl font-bold text-amber-800 mb-2">
            Access Restricted
          </h2>
          <p className="text-amber-700">
            We couldn't verify your access or course details.
          </p>
          <button
            onClick={() => router.push("/auth/login")}
            className="mt-6 px-6 py-2.5 bg-amber-600  rounded-xl text-sm font-semibold hover:bg-amber-700 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const firstName = teacher.name;
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      {/* Welcome Hero Section */}
      <div className=" rounded-2xl p-6 md:p-8 mb-8  shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Welcome back, {firstName}
            </h1>
            <p className=" mt-1 text-sm md:text-base">
              You are managing{" "}
              <span className="font-semibol">{courses.length} courses</span>
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2 ">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push("/dashboard/discuss")}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/10 backdrop-blur-sm hover:bg-white/20  text-sm font-semibold rounded-xl transition-all border border-white/20 shadow-sm"
          >
            <MessageSquare className="h-4 w-4" />
            Communication Hub
          </button>
        </div>
      </div>

      {/* Courses Section */}
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Your Courses</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage and monitor your active courses
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      </div>
    </div>
  );
}
