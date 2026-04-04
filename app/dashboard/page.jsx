"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Users, MessageSquare, GraduationCap } from "lucide-react";
import CourseCard from "@/component/CourseCard";
import { useTeacher } from "@/app/context/AuthContext";
import { useCourse } from "@/app/context/CourseContext";
import LoadingComponent from "@/component/Loading";
import ErrorMessage from "@/component/Error";
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
  const [totalStudents, setTotalStudents] = useState(0);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const isInitialLoading = teacherLoading || courseLoading;

  // Fetch students for each course
  useEffect(() => {
    const fetchStudentsForCourses = async () => {
      if (!teacherEnrollments || teacherEnrollments.length === 0) {
        setCourseStudentsMap({});
        setTotalStudents(0);
        return;
      }

      setLoadingStudents(true);

      try {
        const studentsData = {};
        let allStudentsSet = new Set();

        // Fetch students for each enrollment
        const enrollmentPromises = teacherEnrollments.map(
          async (enrollment) => {
            try {
              const res = await api.get(
                `/api/enrollments/course/${enrollment.course_id}`,
              );

              // Extract students based on your API response structure
              let courseStudents = [];
              if (res.data?.students) {
                courseStudents = res.data.students;
              } else if (res.data?.enrollments) {
                courseStudents = res.data.enrollments;
              } else if (Array.isArray(res.data)) {
                courseStudents = res.data;
              } else if (res.data?.data) {
                courseStudents = res.data.data;
              }

              studentsData[enrollment.course_id] = courseStudents;

              // Add to unique students set
              courseStudents.forEach((student) => {
                if (student?._id) {
                  allStudentsSet.add(student._id);
                }
              });

              return {
                courseId: enrollment.course_id,
                students: courseStudents,
              };
            } catch (err) {
              console.error(
                `Error fetching students for course ${enrollment.course_id}:`,
                err,
              );
              studentsData[enrollment.course_id] = [];
              return { courseId: enrollment.course_id, students: [] };
            }
          },
        );

        await Promise.all(enrollmentPromises);
        setCourseStudentsMap(studentsData);
        setTotalStudents(allStudentsSet.size);
      } catch (error) {
        console.error("Error fetching course students:", error);
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudentsForCourses();
  }, [teacherEnrollments]);

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
        <ErrorMessage
          message={
            teacherError || courseError || "Failed to load dashboard data."
          }
        />
      </div>
    );
  }

  // Check if courses exist and is array
  const hasCourses = courses && Array.isArray(courses) && courses.length > 0;

  if (!teacher || !hasCourses) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-amber-50 border border-amber-200 p-8 rounded-2xl max-w-md">
          <h2 className="text-xl font-bold text-amber-800 mb-2">
            Access Restricted
          </h2>
          <p className="text-amber-700">
            We couldn't verify your access or course details. Please try logging
            in again.
          </p>
          <button
            onClick={() => router.push("/auth/login")}
            className="mt-6 px-6 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-8xl mx-auto space-y-8">
      {/* Consolidated Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-xl shadow border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Welcome back,
            <span className="text-indigo-600">
              {" "}
              {teacher.name || "Teacher"}
            </span>
          </h1>
          <p className="text-gray-500 mt-1">
            You are managing{" "}
            <span className="font-semibold text-gray-700">
              {courses.length} courses
            </span>
            . Here's what's happening with your students today.
          </p>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-indigo-500" />
              <span className="text-sm text-gray-600">
                <span className="font-semibold text-indigo-600">
                  {totalStudents}
                </span>{" "}
                total students enrolled
              </span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-indigo-500" />
              <span className="text-sm text-gray-600">
                <span className="font-semibold text-indigo-600">
                  {courses.length}
                </span>{" "}
                active courses
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/dashboard/discuss`)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm border border-indigo-700 hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
          >
            <MessageSquare size={18} />
            Communication Hub
          </button>
        </div>
      </div>

      <div className="w-full">
        <div className="space-y-4 w-full">
          <div className="flex flex-wrap items-center justify-between px-2">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <BookOpen size={24} className="text-indigo-600" />
              Course Overview
            </h2>
            {totalStudents > 0 && (
              <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full">
                <Users size={18} className="text-indigo-600" />
                <span className="text-sm font-semibold text-indigo-700">
                  {totalStudents} Total Students Enrolled
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-6 flex-wrap">
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
    </div>
  );
}
