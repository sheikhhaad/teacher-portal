import React from 'react';
import { User, Mail, Key, Calendar, BookOpen, ChevronRight } from 'lucide-react';

const TeacherCard = ({ teacher, courseName }) => {
  return (
    <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl shadow-xl p-6 border border-emerald-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Teacher Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="bg-emerald-600 text-white p-3 rounded-full shadow-lg">
            <User size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{teacher.name}</h3>
            <p className="text-sm text-emerald-600 font-medium">Course Instructor</p>
          </div>
        </div>
        <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          ID: {teacher._id?.slice(-6)}
        </div>
      </div>

      {/* Teacher Details */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3 bg-white p-3 rounded-xl shadow-sm">
          <Mail className="text-emerald-500" size={20} />
          <div className="flex-1">
            <p className="text-xs text-gray-500">Email</p>
            <p className="font-semibold text-gray-700 break-all">{teacher.email}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-white p-3 rounded-xl shadow-sm">
          <Key className="text-emerald-500" size={20} />
          <div className="flex-1">
            <p className="text-xs text-gray-500">Password</p>
            <p className="font-mono font-semibold text-gray-700">
              {'•'.repeat(teacher.password?.length || 6)}
            </p>
          </div>
        </div>

        {/* Assigned Course */}
        {courseName && (
          <div className="flex items-center space-x-3 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
            <BookOpen className="text-emerald-600" size={20} />
            <div className="flex-1">
              <p className="text-xs text-gray-500">Assigned Course</p>
              <p className="font-semibold text-emerald-700">{courseName}</p>
            </div>
            <ChevronRight size={20} className="text-emerald-500" />
          </div>
        )}

        {/* Course ID */}
        <div className="text-xs bg-gray-100 p-2 rounded-lg text-gray-600">
          <span className="font-semibold">Course ID:</span> {teacher.course_id}
        </div>
      </div>

      {/* Meta Info */}
      <div className="mt-6 flex flex-wrap gap-2 text-xs text-gray-500 border-t pt-4 border-emerald-100">
        <span className="bg-gray-100 px-3 py-1 rounded-full">
          Joined: {new Date(teacher.createdAt).toLocaleDateString()}
        </span>
        <span className="bg-gray-100 px-3 py-1 rounded-full">
          Last Updated: {new Date(teacher.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default TeacherCard;