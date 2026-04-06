"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Users, MessageSquare, TrendingUp, Calendar } from "lucide-react";
import CourseCard from "@/component/CourseCard";
import { useTeacher } from "@/app/context/AuthContext";
import { useCourse } from "@/app/context/CourseContext";
import { useEnrollMent } from "../context/EnrollStuContext";
import api from "@/utils/api";

export default function Home() {
  const router = useRouter();
  const { teacher, error: teacherError, loading: teacherLoading } = useTeacher();
  const { courses, error: courseError, loading: courseLoading } = useCourse();
  const { teacherEnrollments } = useEnrollMent();

  const [courseStudentsMap, setCourseStudentsMap] = useState({});
  const [totalStudents, setTotalStudents] = useState(0);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const isLoading = teacherLoading || courseLoading || loadingStudents;

  // Fetch students for each course
  useEffect(() => {
    const fetchStudentsForCourses = async () => {
      if (!teacherEnrollments?.length) {
        setCourseStudentsMap({});
        setTotalStudents(0);
        return;
      }

      setLoadingStudents(true);
      const studentsData = {};
      const allStudentIds = new Set();

      await Promise.all(
        teacherEnrollments.map(async (enrollment) => {
          try {
            const res = await api.get(`/api/enrollments/course/${enrollment.course_id}`);
            let courseStudents = [];
            if (res.data?.students) courseStudents = res.data.students;
            else if (res.data?.enrollments) courseStudents = res.data.enrollments;
            else if (Array.isArray(res.data)) courseStudents = res.data;
            else if (res.data?.data) courseStudents = res.data.data;

            studentsData[enrollment.course_id] = courseStudents;
            courseStudents.forEach((student) => student?._id && allStudentIds.add(student._id));
          } catch (err) {
            console.error(`Error fetching students for course ${enrollment.course_id}:`, err);
            studentsData[enrollment.course_id] = [];
          }
        })
      );

      setCourseStudentsMap(studentsData);
      setTotalStudents(allStudentIds.size);
      setLoadingStudents(false);
    };

    fetchStudentsForCourses();
  }, [teacherEnrollments]);

  // Error state
  if (teacherError || courseError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center max-w-md w-full">
          <p className="text-rose-700 font-medium">{teacherError || courseError || "Failed to load data."}</p>
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
          <p className="mt-4 text-slate-500 text-sm font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // No teacher or courses
  if (!teacher || !courses?.length) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center max-w-md w-full">
          <h2 className="text-xl font-bold text-amber-800 mb-2">Access Restricted</h2>
          <p className="text-amber-700">We couldn't verify your access or course details.</p>
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

  const firstName = teacher.name
  const stats = [
    { label: "Active Courses", value: courses.length, icon: BookOpen, color: "text-blue-600 bg-blue-50" },
    { label: "Total Students", value: totalStudents, icon: Users, color: "text-emerald-600 bg-emerald-50" },
    { label: "Completion Rate", value: "—", icon: TrendingUp, color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      {/* Welcome Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 md:p-8 mb-8  shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Welcome back, {firstName}
            </h1>
            <p className=" mt-1 text-sm md:text-base">
              You are managing <span className="font-semibol">{courses.length} courses</span> with{" "}
              <span className="font-semibold  ">{totalStudents} students</span>.
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2 ">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {stats.map((stat, idx) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-2.5 rounded-lg`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Courses Section */}
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Your Courses</h2>
            <p className="text-xs text-slate-400 mt-0.5">Manage and monitor your active courses</p>
          </div>
          {totalStudents > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
              <Users className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-xs font-medium text-slate-600">{totalStudents} students total</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              studentCount={courseStudentsMap[course._id]?.length || 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
}