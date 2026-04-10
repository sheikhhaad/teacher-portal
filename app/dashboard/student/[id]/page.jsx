"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { useQueries } from "@/app/context/QueryContext";
import api from "@/utils/api";
import Button from "@/component/Button";
import Loading from "@/component/Loading";
import StateMessage from "@/component/StateMessage";
import { useCourse } from "@/app/context/CourseContext";

const StudentQueriesPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { queries, loading: queriesLoading } = useQueries();
  const { courses, loading: coursesLoading } = useCourse();

  const [student, setStudent] = useState(null);
  const [studentLoading, setStudentLoading] = useState(true);
  const [studentQueries, setStudentQueries] = useState([]);

  // Fetch student details
  useEffect(() => {
    const fetchStudent = async () => {
      if (!id) return;
      try {
        const res = await api.get(`/api/auth/student/${id}`);
        setStudent(res.data.student);
      } catch (err) {
        console.error("Failed to fetch student:", err);
      } finally {
        setStudentLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  // Filter queries for this student and attach course title
  useEffect(() => {
    if (queries && id && courses.length > 0) {
      const filtered = queries.filter(
        (q) => String(q.student_id) === String(id),
      );
      const enhanced = filtered.map((q) => {
        const course = courses.find(
          (c) => String(c._id) === String(q.course_id),
        );
        return { ...q, course_title: course?.name || "Unknown Course" };
      });
      setStudentQueries(enhanced);
    } else if (queries && id && !coursesLoading && courses.length === 0) {
      // Courses loaded but empty – still show queries with fallback
      const filtered = queries.filter(
        (q) => String(q.student_id) === String(id),
      );
      const enhanced = filtered.map((q) => ({
        ...q,
        course_title: "Unknown Course",
      }));
      setStudentQueries(enhanced);
    }
  }, [queries, id, courses, coursesLoading]);

  const pendingCount = studentQueries.filter(
    (q) => q.status === "pending",
  ).length;
  const resolvedCount = studentQueries.filter(
    (q) => q.status === "resolved",
  ).length;
  const totalCount = studentQueries.length;

  if (studentLoading) {
    return <Loading message="Loading student profile..." />;
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <StateMessage
          icon={User}
          title="Student not found"
          description="The requested student could not be found."
        />
      </div>
    );
  }

  const initials = student.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "S";

  return (
    <div className="min-h-screen bg-gray-50/30 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header with back button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => router.back()}
              icon={ArrowLeft}
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Student Profile
              </h1>
              <p className="text-sm text-gray-500">
                Manage and view student details
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Student Info Card */}
        <div className="relative overflow-hidden bg-white rounded-3xl shadow-sm border border-gray-100">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -translate-y-16 translate-x-16 blur-2xl opacity-50" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-violet-50 rounded-full translate-y-12 -translate-x-12 blur-2xl opacity-50" />
          
          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Profile Image */}
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 p-1 shadow-lg ring-1 ring-black/5">
                  {student.profilePic ? (
                    <img
                      src={student.profilePic}
                      alt={student.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-indigo-600 text-4xl font-black">
                      {initials}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-6 h-6 rounded-full border-4 border-white shadow-sm" />
              </div>

              {/* Student Details */}
              <div className="flex-1 text-center md:text-left space-y-4">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                    {student.name}
                  </h2>
                  <p className="text-indigo-600 font-semibold mt-1">
                    Registered Student
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-center md:justify-start gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                      <Mail size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</p>
                      <p className="text-sm font-semibold text-gray-700">{student.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center md:justify-start gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Roll Number</p>
                      <p className="text-sm font-semibold text-gray-700">{student.rollNumber || "Not Assigned"}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center md:justify-start gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                      <Phone size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone Number</p>
                      <p className="text-sm font-semibold text-gray-700">{student.phone || "Not Provided"}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center md:justify-start gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Since</p>
                      <p className="text-sm font-semibold text-gray-700">
                        {new Date(student.createdAt).toLocaleDateString("en-US", { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Queries</p>
                <p className="text-3xl font-bold text-gray-900">{totalCount}</p>
              </div>
              <MessageSquare className="text-indigo-500" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending</p>
                <p className="text-3xl font-bold text-amber-600">
                  {pendingCount}
                </p>
              </div>
              <Clock className="text-amber-500" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Resolved</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {resolvedCount}
                </p>
              </div>
              <CheckCircle className="text-emerald-500" size={32} />
            </div>
          </div>
        </div>

        {/* Queries List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <AlertCircle size={18} className="text-indigo-600" />
              Query History
            </h3>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg" onClick={() => router.push(`/dashboard/discuss/${student._id}`)}>Chat with Student</button>
          </div>

          <div className="p-6">
            {queriesLoading || coursesLoading ? (
               <div className="flex flex-col items-center justify-center py-12 space-y-4">
                 <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-100 border-t-indigo-600" />
                 <p className="text-sm text-gray-500 font-medium">Loading query history...</p>
               </div>
            ) : studentQueries.length === 0 ? (
              <StateMessage
                icon={MessageSquare}
                title="No queries found"
                description="This student hasn't asked any questions yet."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Question
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Response
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {studentQueries.map((q) => (
                      <tr key={q._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {q.course_title}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 max-w-md">
                          <div className="truncate">{q.query}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold ${
                              q.status === "resolved"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {q.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-md">
                          <div className="truncate">{q.answer || "—"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(q.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentQueriesPage;
