"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Users, Search, ArrowLeft, Eye } from "lucide-react";
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
  const [currentCourse, setCurrentCourse] = useState(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        // Find course info
        const course = courses.find((c) => String(c._id) === String(id));
        setCurrentCourse(course);

        // Fetch students for this course
        const res = await api.get(`/api/enrollments/course/${id}`);
        let courseStudents = [];

        if (res.data?.students) courseStudents = res.data.students;
        else if (res.data?.enrollments) courseStudents = res.data.enrollments;
        else if (Array.isArray(res.data)) courseStudents = res.data;

        // Normalize students
        const normalized = courseStudents
          .map((item) => {
            const studentData =
              item.student_id && typeof item.student_id === "object"
                ? item.student_id
                : item.student || item;
            return studentData;
          })
          .filter((s) => s?._id);

        setStudents(normalized);
      } catch (err) {
        console.error("Failed to fetch course students:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!courseLoading) {
      fetchCourseData();
    }
  }, [id, courses, courseLoading]);

  const filteredStudents = students.filter(
    (student) =>
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading || courseLoading) {
    return <Loading message="Loading students for this course..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
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
              <h1 className="text-2xl font-bold text-gray-900">
                {currentCourse?.title || "Course Students"}
              </h1>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <Users size={14} />
                {students.length} enrolled student
                {students.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name, roll no, or email..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Students List (Table) */}
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center border">
            <Users className="mx-auto text-gray-400 mb-2" size={40} />
            <h3 className="text-lg font-medium text-gray-900">
              No students found
            </h3>
            <p className="text-gray-500">Try adjusting your search term.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roll Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.rollNumber || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => router.push(`/dashboard/student/${student._id}`)}
                          className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-full transition-colors"
                          title="View Profile"
                        >
                          <Eye size={20} />
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
