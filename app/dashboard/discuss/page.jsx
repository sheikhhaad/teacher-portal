"use client";
import React from "react";
import { useEnrollMent } from "@/app/context/EnrollStuContext";
import { useRouter } from "next/navigation";
import { MessageSquare, User, Loader2, ChevronRight } from "lucide-react";

const Page = () => {
  const { enrollMent, loading } = useEnrollMent();
  const router = useRouter();

  const openChat = (student_id) => {
    router.push(`/dashboard/discuss/${student_id}`);
  };

  const students = enrollMent?.students || [];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">
          Loading enrolled students...
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

        {students.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-16 text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="h-10 w-10 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Students Enrolled
            </h3>
            <p className="text-gray-500">
              When students enroll in your courses, they will appear here for
              direct messaging.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student, index) => (
              <div
                key={student._id}
                onClick={() => openChat(student._id)}
                className="group bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-100 to-blue-50 flex items-center justify-center text-indigo-600 font-bold text-xl shadow-inner border border-white">
                    {student.name ? student.name.charAt(0).toUpperCase() : "S"}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:bg-indigo-500 group-hover:border-indigo-500 transition-all text-gray-400 group-hover:text-white group-hover:shadow-md">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {student.name || "Unknown Student"}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      Roll No: {student.rollNumber || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
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
