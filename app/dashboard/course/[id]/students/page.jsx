"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Users, Search, ArrowLeft, Eye, User } from "lucide-react";
import api from "@/utils/api";
import { useCourse } from "@/app/context/CourseContext";
import Button from "@/component/Button";
import Loading from "@/component/Loading";

export default function CourseStudentsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { courses, loading: courseLoading } = useCourse();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Find course title from context (or fallback)
  const courseTitle =
    courses.find((c) => String(c._id) === String(id))?.title ||
    "Course Students";

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await api.get(`/api/enrollments/course/${id}`);
        let enrolledData = [];

        if (res.data?.students) enrolledData = res.data.students;
        else if (res.data?.enrollments) enrolledData = res.data.enrollments;
        else if (Array.isArray(res.data)) enrolledData = res.data;

        // Extract student objects from enrollments
        const studentList = enrolledData
          .map((item) => {
            // Handle different response shapes
            if (item.student_id && typeof item.student_id === "object")
              return item.student_id;
            if (item.student && typeof item.student === "object")
              return item.student;
            return item; // assume it's already a student object
          })
          .filter((s) => s?._id); // remove invalid entries

        setStudents(studentList);
      } catch (err) {
        console.error("Failed to fetch course students:", err);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch when course context is done loading (prevents race conditions)
    if (!courseLoading) fetchCourseData();
  }, [id, courseLoading]);

  const filteredStudents = students.filter(
    (student) =>
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading || courseLoading) {
    return <Loading message="Loading enrolled students..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => router.back()}
              icon={ArrowLeft}
            />
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                {courseTitle}
              </h1>
              <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                <Users size={14} />
                {students.length} enrolled student
                {students.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name, roll no, or email..."
              className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl w-full md:w-80 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Students List */}
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-slate-300" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">
              No students found
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              {searchTerm
                ? "Try adjusting your search term."
                : "This course has no enrolled students yet."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Roll Number
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredStudents.map((student) => (
                    <tr
                      key={student._id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                            {student.profilePic ? (
                              <img
                                src={student.profilePic}
                                alt={student.name}
                                width={24}
                                height={24}
                                className="rounded-full"
                              />
                            ) : (
                              <User size={14} />
                            )}
                          </div>
                          <span className="text-sm font-medium text-slate-700">
                            {student.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {student.rollNumber || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {student.phone || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() =>
                            router.push(`/dashboard/student/${student._id}`)
                          }
                          className="p-2 rounded-lg text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                          title="View Profile"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
