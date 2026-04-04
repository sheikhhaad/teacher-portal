import React from "react";
import {
  BookOpen,
  Clock,
  Calendar,
  Hash,
  ChevronRight,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";

const CourseCard = ({ course, studentCount }) => {
  const daysArray = course?.days?.split(",") || [];
  const router = useRouter();

  if (!course) return null;

  return (
    <div
      className="premium-panel max-w-lg rounded-2xl bg-white p-6 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
      onClick={() => {
        router.push(`/dashboard/course/${course._id}`);
      }}
    >
      {/* Course Code Badge and Student Count */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
            <Hash size={16} />
            <span>{course.code || "N/A"}</span>
          </div>
          {studentCount !== undefined && (
            <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-bold border border-indigo-100">
              <Users size={14} />
              <span>
                {studentCount} {studentCount === 1 ? "Student" : "Students"}
              </span>
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          ID: {course._id?.slice(-6) || "N/A"}
        </div>
      </div>

      {/* Course Name */}
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <BookOpen className="mr-3 text-indigo-600" size={24} />
        {course.name || "Unnamed Course"}
      </h2>

      {/* Course Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-3 bg-white p-3 rounded-xl shadow-sm">
          <Calendar className="text-indigo-500" size={20} />
          <div>
            <p className="text-xs text-gray-500">Days</p>
            <p className="font-semibold text-gray-700">
              {daysArray.length > 0 ? (
                daysArray.map((day, index) => (
                  <span key={index} className="inline-block mr-2">
                    {day.trim()}
                  </span>
                ))
              ) : (
                <span className="text-gray-400">Not specified</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-white p-3 rounded-xl shadow-sm">
          <Clock className="text-indigo-500" size={20} />
          <div>
            <p className="text-xs text-gray-500">Time</p>
            <p className="font-semibold text-gray-700">
              {course.time || (
                <span className="text-gray-400">Not specified</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      {course.description && (
        <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
          <p className="text-gray-700 italic">"{course.description}"</p>
        </div>
      )}

      {/* Meta Info */}
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
        {course.createdAt && (
          <span className="bg-gray-100 px-3 py-1 rounded-full">
            Created: {new Date(course.createdAt).toLocaleDateString()}
          </span>
        )}
        {course.updatedAt && (
          <span className="bg-gray-100 px-3 py-1 rounded-full">
            Updated: {new Date(course.updatedAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
