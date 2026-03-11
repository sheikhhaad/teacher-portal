import React, { useState } from "react";
import { Megaphone, X } from "lucide-react";
import Button from "./Button";

export default function AnnouncementModal({ isOpen, onClose, onSubmit }) {
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ description });
      setDescription("");
      onClose();
    } catch (error) {
      console.error("Error submitting announcement:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-indigo-50/50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Megaphone size={18} className="text-white" />
            </div>
            Make an Announcement
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-sm font-bold text-gray-700 uppercase tracking-wider block"
            >
              Details
            </label>
            <textarea
              id="description"
              required
              className="w-full border-2 border-gray-100 focus:border-indigo-500 focus:ring-0 p-4 rounded-xl min-h-[140px] transition-all text-gray-800"
              placeholder="Provide all necessary details for your students..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Publish Announcement
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
