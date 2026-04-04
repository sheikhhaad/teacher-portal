"use client";
import React, { useEffect, useState } from "react";
import { useEnrollMent } from "@/app/context/EnrollStuContext";
import { useRouter } from "next/navigation";
import { MessageSquare, User, Loader2, ChevronRight, BookOpen } from "lucide-react";
import api from "@/utils/api";

const Page = () => {
  const { teacherEnrollments, loading } = useEnrollMent();
  const [students, setStudents] = useState([]);
  const [coursesData, setCoursesData] = useState([]);
  const [fetchingStudents, setFetchingStudents] = useState(false);
  const router = useRouter();

  const fetchStudentsFromAllCourses = async () => {
    if (!teacherEnrollments || teacherEnrollments.length === 0) {
      setStudents([]);
      setCoursesData([]);
      return;
    }

    setFetchingStudents(true);
    
    try {
      // Fetch students for each course in parallel
      const coursePromises = teacherEnrollments.map(async (enrollment) => {
        try {
          const res = await api.get(`/api/enrollments/course/${enrollment.course_id}`);
          
          // Extract students from response (adjust based on your API response structure)
          let courseStudents = [];
          if (res.data?.students) {
            courseStudents = res.data.students;
          } else if (res.data?.enrollments) {
            courseStudents = res.data.enrollments;
          } else if (Array.isArray(res.data)) {
            courseStudents = res.data;
          } else if (res.data?.data) {
            courseStudents = res.data.data;
          } else {
            courseStudents = [];
          }

          return {
            courseId: enrollment.course_id,
            students: courseStudents,
            enrollmentId: enrollment._id,
            createdAt: enrollment.createdAt
          };
        } catch (err) {
          console.error(`Error fetching students for course ${enrollment.course_id}:`, err);
          return {
            courseId: enrollment.course_id,
            students: [],
            enrollmentId: enrollment._id,
            error: err.message
          };
        }
      });

      const results = await Promise.all(coursePromises);
      setCoursesData(results);
      
      // Combine all students from all courses and remove duplicates
      const allStudentsMap = new Map();
      results.forEach(course => {
        course.students.forEach(student => {
          if (student && student._id && !allStudentsMap.has(student._id)) {
            allStudentsMap.set(student._id, student);
          }
        });
      });
      
      const uniqueStudents = Array.from(allStudentsMap.values());
      setStudents(uniqueStudents);
      
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
    } finally {
      setFetchingStudents(false);
    }
  };

  useEffect(() => {
    if (teacherEnrollments && teacherEnrollments.length > 0) {
      fetchStudentsFromAllCourses();
    } else {
      setStudents([]);
      setCoursesData([]);
    }
  }, [teacherEnrollments]);

  const openChat = (student_id) => {
    router.push(`/dashboard/discuss/${student_id}`);
  };

  if (loading || fetchingStudents) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">
          {loading ? "Loading enrolled students..." : "Fetching course data..."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto py-4">
        <div className="mb-8">
          <div className="inline-flex p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Student Discussions
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Connect and converse with your enrolled students directly.
          </p>
        </div>

        {/* Display Course-wise Students */}
        {coursesData.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="h-6 w-6 text-indigo-500" />
              <h2 className="text-2xl font-bold text-gray-800">Courses & Students</h2>
            </div>
            
            <div className="space-y-8">
              {coursesData.map((course, idx) => (
                <div key={course.courseId} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-800">
                      Course {idx + 1}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Course ID: {course.courseId}
                    </p>
                    <p className="text-xs text-gray-400">
                      Enrolled Students: {course.students.length}
                    </p>
                  </div>
                  
                  <div className="p-6">
                    {course.students.length === 0 ? (
                      <div className="text-center py-8">
                        <User className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-400">No students enrolled in this course yet</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {course.students.map((student) => (
                          <div
                            key={student._id}
                            onClick={() => openChat(student._id)}
                            className="group bg-gray-50 rounded-xl p-4 hover:bg-indigo-50 transition-all duration-300 cursor-pointer border border-transparent hover:border-indigo-200"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold text-sm">
                                {student.name ? student.name.charAt(0).toUpperCase() : "S"}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800 group-hover:text-indigo-600 truncate">
                                  {student.name || "Unknown Student"}
                                </p>
                                {student.email && (
                                  <p className="text-xs text-gray-500 truncate">
                                    {student.email}
                                  </p>
                                )}
                                {student.rollNumber && (
                                  <p className="text-xs text-gray-400">
                                    Roll: {student.rollNumber}
                                  </p>
                                )}
                              </div>
                              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

   

      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default Page;