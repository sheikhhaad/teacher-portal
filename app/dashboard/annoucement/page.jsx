"use client";
import React, { useEffect, useState, useCallback } from "react";
import api from "@/utils/api";
import { useTeacher } from "@/app/context/AuthContext";
import { useCourse } from "@/app/context/CourseContext";
import {
  Pencil,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Clock,
  Calendar,
  RefreshCw,
  Megaphone,
  LogIn,
  Loader2,
  BookOpen,
} from "lucide-react";
import AnnouncementModal from "@/component/AnnouncementModal";

export default function AnnouncementsPage() {
  const { teacher } = useTeacher();
  const { courses } = useCourse();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Set default course when courses load
  useEffect(() => {
    if (courses?.length && !selectedCourseId) {
      setSelectedCourseId(courses[0]._id);
    }
  }, [courses, selectedCourseId]);

  const fetchAnnouncements = useCallback(async () => {
    if (!teacher?._id || !selectedCourseId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(
        `/api/announcements/${teacher._id}/course/${selectedCourseId}`,
      );
      setAnnouncements(Array.isArray(res.data) ? res.data : [res.data]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  }, [teacher?._id, selectedCourseId]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/announcements/deleteannouncement/${id}`);
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
      setDeleteConfirmId(null);
      showSuccess("Announcement deleted");
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleUpdate = async (id) => {
    if (!editText.trim()) {
      setError("Text cannot be empty");
      return;
    }
    try {
      const res = await api.put(`/api/announcements/updateannouncement/${id}`, {
        text: editText,
      });
      const updated = res.data;
      setAnnouncements((prev) =>
        prev.map((a) => (a._id === updated._id ? updated : a)),
      );
      setEditingId(null);
      setEditText("");
      showSuccess("Announcement updated");
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
      setTimeout(() => setError(null), 5000);
    }
  };

  const startEdit = (ann) => {
    setEditingId(ann._id);
    setEditText(ann.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleCreate = async (data) => {
    try {
      const res = await api.post("/api/announcements/create", {
        teacher_id: teacher._id,
        course_id: data.course_id || selectedCourseId,
        text: data.description,
      });
      const newAnn = res.data;
      setAnnouncements((prev) => [newAnn, ...prev]);
      setIsModalOpen(false);
      showSuccess("Announcement created");
    } catch (err) {
      setError("Failed to create announcement");
      setTimeout(() => setError(null), 5000);
    }
  };

  // Authentication guard
  if (!teacher) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center max-w-md w-full shadow-sm">
          <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="h-6 w-6 text-amber-500" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mb-1">
            Authentication Required
          </h2>
          <p className="text-slate-500 text-sm">
            Please log in to view announcements
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-slate-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 shadow-sm">
            <Megaphone className="h-5 w-5 " />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Announcements</h1>
          <p className="text-slate-500 text-sm mt-1">
            Important updates for your courses
          </p>
        </div>

        {/* Controls Card */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                Select Course
              </label>
              <div className="relative">
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-300"
                >
                  {courses?.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.name} ({course.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 hover:bg-slate-900 text-sm font-medium rounded-lg transition shadow-sm"
            >
              <Megaphone className="h-4 w-4" />
              New Announcement
            </button>
          </div>
        </div>

        {/* Success / Error toasts */}
        {successMsg && (
          <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-700 text-sm">
            <Check className="h-4 w-4" />
            {successMsg}
          </div>
        )}
        {error && (
          <div className="mb-5 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between text-rose-700 text-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
            <button
              onClick={() => setError(null)}
              className="text-rose-500 hover:text-rose-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Announcements list */}
        {announcements.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 p-12 text-center shadow-sm">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Megaphone className="h-6 w-6 text-slate-300" />
            </div>
            <h3 className="text-base font-semibold text-slate-700 mb-1">
              No announcements
            </h3>
            <p className="text-slate-400 text-sm">
              Create your first announcement using the button above.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {announcements.map((ann) => {
              const isEditing = editingId === ann._id;
              const isDeleting = deleteConfirmId === ann._id;
              const courseInfo = courses?.find((c) => c._id === ann.course_id);
              return (
                <div
                  key={ann._id}
                  className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md"
                >
                  {/* Delete confirmation inline */}
                  {isDeleting && (
                    <div className="bg-amber-50 p-4 border-b border-amber-100">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-amber-800 text-sm font-medium mb-3">
                            Delete this announcement? This cannot be undone.
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDelete(ann._id)}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700  text-xs font-medium rounded-lg"
                            >
                              Yes, delete
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-5">
                    {isEditing ? (
                      <div className="space-y-3">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={3}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-300 resize-none"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdate(ann._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-slate-700 "
                          >
                            <Check className="h-3.5 w-3.5" />
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Course badge */}
                        {courseInfo && (
                          <div className="mb-3">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                              <BookOpen className="h-3 w-3" />
                              {courseInfo.name}
                            </span>
                          </div>
                        )}
                        <p className="text-slate-700 text-base leading-relaxed mb-3">
                          {ann.text}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-4 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(ann.createdAt).toLocaleString()}
                          </div>
                          {ann.updatedAt !== ann.createdAt && (
                            <div className="flex items-center gap-1">
                              <RefreshCw className="h-3 w-3" />
                              edited
                            </div>
                          )}
                          {ann.date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(ann.date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(ann)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-200 transition"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(ann._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 text-xs font-medium rounded-lg hover:bg-rose-100 transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AnnouncementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreate}
        courses={courses}
        defaultCourseId={selectedCourseId}
      />
    </div>
  );
}
