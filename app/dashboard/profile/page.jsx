"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTeacher } from "@/app/context/AuthContext";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Shield,
  Camera,
  Edit3,
  Award,
  BookOpen,
  Save,
  X,
  Loader2
} from "lucide-react";
import { useCourse } from "@/app/context/CourseContext";
import api from "@/utils/api";
import { toast } from "react-hot-toast";

export default function ProfilePage() {
  const { teacher, setTeacher } = useTeacher();
  const { courses } = useCourse();

  // Editing States
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    phone: ""
  });

  // Image states
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  console.log(teacher.profilePic
);
  // Initialize form data when entering edit mode or when teacher data loads
  useEffect(() => {
    if (teacher) {
      setFormData({
        email: teacher.email || "",
        phone: teacher.phone || ""
      });
    }
  }, [teacher, isEditing]);

  if (!teacher) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 border-t-indigo-600" />
      </div>
    );
  }

  const initials =
    teacher.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "T";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing
      setIsEditing(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    } else {
      setIsEditing(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      // Do NOT send name - it's not updatable
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      
      if (selectedFile) {
        data.append("profilePic", selectedFile);
      }

      const res = await api.put(`/api/auth/teacher/update/${teacher._id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.teacher) {
        setTeacher(res.data.teacher);
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        setSelectedFile(null);
        setPreviewUrl(null);
      }
    } catch (err) {
      console.error("Update failed:", err);
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <form onSubmit={handleSubmit}>
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {/* Header Profile Section */}
        <div className="relative mb-8">
          <div className="h-48 w-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-64 h-64 bg-black/10 rounded-full blur-3xl" />
          </div>

          <div className="px-6 sm:px-12 -mt-20 flex flex-col sm:flex-row items-end gap-6 relative z-10">
            <div className="relative group">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white p-2 shadow-2xl overflow-hidden ring-4 ring-white/20">
                {(previewUrl || teacher.profilePic) ? (
                  <img
                    src={previewUrl || teacher.profilePic}
                    alt={teacher.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-4xl sm:text-5xl">
                    {initials}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-2 right-2 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all border-4 border-white group-hover:scale-110 z-20"
              >
                <Camera size={20} />
              </button>
            </div>

            <div className="flex-1 pb-4 text-center sm:text-left">
              {/* Name is read-only, no editing allowed */}
              <h1 className="text-3xl font-bold text-gray-900">
                {teacher.name}
              </h1>
              <p className="text-indigo-600 font-semibold flex items-center justify-center sm:justify-start gap-2 mt-1">
                <Shield size={16} />
                Senior Instructor
              </p>
            </div>

            <div className="pb-4 flex gap-3">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleEditToggle}
                    className="px-4 py-2 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition flex items-center gap-2"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl shadow-md shadow-indigo-200 hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-70"
                  >
                    {loading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Save size={18} />
                    )}
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleEditToggle}
                  className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl shadow-md shadow-indigo-200 hover:bg-indigo-700 transition flex items-center gap-2"
                >
                  <Edit3 size={18} />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Stats & Quick Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-5">
                Quick Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl text-center">
                  <BookOpen size={24} className="mx-auto text-indigo-600 mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {courses?.length || 0}
                  </p>
                  <p className="text-xs font-semibold text-gray-400 uppercase">
                    Courses
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl text-center">
                  <Award size={24} className="mx-auto text-amber-500 mb-2" />
                  <p className="text-2xl font-bold text-gray-900">4.9</p>
                  <p className="text-xs font-semibold text-gray-400 uppercase">
                    Rating
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-5">
                Contact Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Mail size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase">
                      Email Address
                    </p>
                    {isEditing ? (
                      <input
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full font-medium text-gray-900 bg-transparent border-b border-indigo-100 focus:border-indigo-600 outline-none"
                      />
                    ) : (
                      <p className="font-medium text-gray-900">
                        {teacher.email || "Not Added"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-gray-600">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Phone size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase">
                      Phone Number
                    </p>
                    {isEditing ? (
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full font-medium text-gray-900 bg-transparent border-b border-indigo-100 focus:border-indigo-600 outline-none"
                        placeholder="+1 234 567 890"
                      />
                    ) : (
                      <p className="font-medium text-gray-900">
                        {teacher.phone || "Not Added"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Location field removed */}
              </div>
            </div>
          </div>

          {/* Right Column: Professional Info (bio removed) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Briefcase size={22} className="text-indigo-600" />
                Professional Info
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-gray-500 font-medium">
                    <Calendar size={18} />
                    Joined Date
                  </div>
                  <div className="text-gray-900 font-bold">
                    {new Date(teacher.createdAt || Date.now()).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-gray-500 font-medium">
                    <Shield size={18} />
                    Status
                  </div>
                  <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full uppercase">
                    Verified Instructor
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-gray-500 font-medium">
                    <Mail size={18} />
                    Account Type
                  </div>
                  <div className="text-gray-900 font-bold">Premium</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}