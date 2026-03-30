"use client";
import React, { useEffect, useState } from "react";
import api from "@/utils/api";
import { useTeacher } from "@/app/context/AuthContext";
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
} from "lucide-react";
import socket from "@/utils/socket";

const Page = () => {
  const { teacher } = useTeacher();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [editText, setEditText] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Fetch announcements initially
  const fetchAnnouncements = async () => {
    if (!teacher?._id || !teacher?.course_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await api.get(
        `/api/announcements/${teacher._id}/course/${teacher.course_id}`,
      );
      setAnnouncements(Array.isArray(res.data) ? res.data : [res.data]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [teacher]);

  useEffect(() => {
    if (!teacher) return;

    // New announcement
    socket.on("new_announcement", (announcement) => {
      if (announcement.course_id === teacher.course_id) {
        setAnnouncements((prev) => [announcement, ...prev]);
      }
    });

    // Updated announcement
    socket.on("update_announcement", (updated) => {
      setAnnouncements((prev) =>
        prev.map((a) => (a._id === updated._id ? updated : a)),
      );
    });

    // Deleted announcement
    socket.on("delete_announcement", ({ id }) => {
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
    });

    return () => {
      socket.off("new_announcement");
      socket.off("update_announcement");
      socket.off("delete_announcement");
    };
  }, [teacher]);
  // Show temporary success message
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Delete announcement
  const handleDelete = async (announcementId) => {
    try {
      const response = await api.delete(
        `/api/announcements/deleteannouncement/${announcementId}`,
      );
      if (response.status === 200) {
        setDeleteConfirm(null);
        showSuccess("Announcement deleted successfully");
        // backend emits automatically → students updated
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete announcement");
      setTimeout(() => setError(null), 5000);
    }
  };

  // Update announcement
  const handleUpdate = async (announcementId) => {
    if (!editText.trim()) {
      setError("Announcement text cannot be empty");
      setTimeout(() => setError(null), 5000);
      return;
    }

    try {
      const response = await api.put(
        `/api/announcements/updateannouncement/${announcementId}`,
        { text: editText },
      );
      if (response.status === 200) {
        setEditingAnnouncement(null);
        setEditText("");
        showSuccess("Announcement updated successfully");
        // backend emits automatically → students updated
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update announcement");
      setTimeout(() => setError(null), 5000);
    }
  };

  // Start editing
  const startEditing = (announcement) => {
    setEditingAnnouncement(announcement._id);
    setEditText(announcement.text);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingAnnouncement(null);
    setEditText("");
  };

  if (!teacher) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-slate-200">
          <div className="inline-flex p-4 bg-amber-50 rounded-full mb-4">
            <LogIn className="h-12 w-12 text-amber-500" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">
            Authentication Required
          </h2>
          <p className="text-slate-600">Please log in to view announcements</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 text-lg">Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Megaphone className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Announcements
          </h1>
          <p className="text-slate-600 mt-2">
            Important updates and information for your class
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-lg shadow-md animate-slide-down">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-emerald-500 mr-2" />
              <p className="text-emerald-800">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-md animate-slide-down">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Announcements List */}
        {announcements.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-slate-100">
            <div className="inline-flex p-4 bg-slate-50 rounded-full mb-4">
              <Megaphone className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              No Announcements Yet
            </h3>
            <p className="text-slate-500">
              Check back later for updates from your instructor.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {announcements.map((announcement, index) => (
              <div
                key={announcement._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Delete Confirmation Dialog */}
                {deleteConfirm === announcement._id && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 border-b border-amber-200">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-amber-800 font-medium mb-3">
                          Are you sure you want to delete this announcement?
                          This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleDelete(announcement._id)}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 font-medium flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Yes, Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg transition-colors duration-200 font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-6">
                  {/* Edit Mode */}
                  {editingAnnouncement === announcement._id ? (
                    <div className="space-y-4">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                        rows="4"
                        placeholder="Edit announcement..."
                        autoFocus
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleUpdate(announcement._id)}
                          className="px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
                        >
                          <Check className="h-4 w-4" />
                          Save Changes
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg transition-all duration-200 font-medium flex items-center gap-2"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Announcement Content */}
                      <p className="text-slate-800 text-lg leading-relaxed mb-4">
                        {announcement.text}
                      </p>

                      {/* Metadata */}
                      <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-5 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          <span>
                            Posted:{" "}
                            {new Date(announcement.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {announcement.updatedAt &&
                          announcement.updatedAt !== announcement.createdAt && (
                            <div className="flex items-center gap-1.5">
                              <RefreshCw className="h-4 w-4" />
                              <span>
                                Edited:{" "}
                                {new Date(
                                  announcement.updatedAt,
                                ).toLocaleString()}
                              </span>
                            </div>
                          )}
                        {announcement.date && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            <span>
                              For:{" "}
                              {new Date(announcement.date).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => startEditing(announcement)}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-lg transition-all duration-200 text-sm font-medium flex items-center gap-2 shadow-sm hover:shadow-md"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(announcement._id)}
                          className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-200 text-sm font-medium flex items-center gap-2 shadow-sm hover:shadow-md"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </>
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
