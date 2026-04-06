"use client";
import React, { useEffect, useState } from "react";
import { useEnrollMent } from "@/app/context/EnrollStuContext";
import { useRouter } from "next/navigation";
import { MessageSquare, User, Loader2, ChevronRight, BookOpen, Users } from "lucide-react";
import api from "@/utils/api";

const Page = () => {
  const { teacherEnrollments, loading } = useEnrollMent();
  const [coursesData, setCoursesData] = useState([]);
  const [fetchingStudents, setFetchingStudents] = useState(false);
  const router = useRouter();

  const fetchStudentsFromAllCourses = async () => {
    if (!teacherEnrollments?.length) {
      setCoursesData([]);
      return;
    }

    setFetchingStudents(true);
    try {
      const coursePromises = teacherEnrollments.map(async (enrollment) => {
        try {
          const res = await api.get(`/api/enrollments/course/${enrollment.course_id}`);
          let courseStudents = [];
          if (res.data?.students) courseStudents = res.data.students;
          else if (res.data?.enrollments) courseStudents = res.data.enrollments;
          else if (Array.isArray(res.data)) courseStudents = res.data;
          else if (res.data?.data) courseStudents = res.data.data;

          return {
            courseId: enrollment.course_id,
            students: courseStudents,
          };
        } catch {
          return { courseId: enrollment.course_id, students: [] };
        }
      });

      const results = await Promise.all(coursePromises);
      setCoursesData(results);
    } catch (error) {
      console.error("Error fetching students:", error);
      setCoursesData([]);
    } finally {
      setFetchingStudents(false);
    }
  };

  useEffect(() => {
    if (teacherEnrollments?.length) fetchStudentsFromAllCourses();
    else setCoursesData([]);
  }, [teacherEnrollments]);

  const openChat = (studentId) => {
    router.push(`/dashboard/discuss/${studentId}`);
  };

  if (loading || fetchingStudents) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 text-slate-400 animate-spin mb-3" />
        <p className="text-slate-500 text-sm">
          {loading ? "Loading enrolled courses..." : "Fetching students..."}
        </p>
      </div>
    );
  }


  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 shadow-sm">
            <MessageSquare className="h-5 w-5 " />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Student Discussions</h1>
          <p className="text-slate-500 text-sm mt-1">
            Connect and chat with students enrolled in your courses
          </p>
        </div>

        {coursesData.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 p-12 text-center shadow-sm">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-slate-300" />
            </div>
            <h3 className="text-base font-semibold text-slate-700 mb-1">No students yet</h3>
            <p className="text-slate-400 text-sm">Students will appear here once they enroll in your courses.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {coursesData.map((course, idx) => (
              <div key={course.courseId} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/30">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base font-semibold text-slate-800">Course {idx + 1}</h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {course.courseId}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-100">
                      <User className="h-3 w-3" />
                      {course.students.length} student{course.students.length !== 1 && "s"}
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  {course.students.length === 0 ? (
                    <div className="text-center py-8">
                      <User className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                      <p className="text-slate-400 text-sm">No students enrolled yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {course.students.map((student) => (
                        <div
                          key={student._id}
                          onClick={() => openChat(student._id)}
                          className="group flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 text-xs font-medium shrink-0">
                              {student.name?.charAt(0).toUpperCase() || "S"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-700 truncate">
                                {student.name || "Unknown Student"}
                              </p>
                              {student.email && (
                                <p className="text-xs text-slate-400 truncate">{student.email}</p>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;