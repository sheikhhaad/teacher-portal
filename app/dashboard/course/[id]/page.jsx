"use client";

import { useTeacher } from "@/app/context/AuthContext";
import { useQueries } from "@/app/context/QueryContext";
import api from "@/utils/api";
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  ArrowLeft,
} from "lucide-react";
import StatsCard from "@/component/StatsCard";
import Button from "@/component/Button";
import Loading from "@/component/Loading";
import StateMessage from "@/component/StateMessage";
import ErrorMessage from "@/component/Error";
import { useRouter } from "next/navigation";

const Page = () => {
  const { id } = useParams();
  const { teacher } = useTeacher();
  const router = useRouter();
  const { queries, loading, error, fetchCourseQueries, updateQueryInList } =
    useQueries();

  const [isInitializing, setIsInitializing] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [answer, setAnswer] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const courseQueries = useMemo(
    () => queries.filter((q) => q.course_id === id),
    [queries, id],
  );

  // Initial fetch
  useEffect(() => {
    const initQueries = async () => {
      setIsInitializing(true);
      await fetchCourseQueries(id, teacher?._id);
      setIsInitializing(false);
    };
    if (id && teacher?._id) {
      initQueries();
    }
  }, [id, teacher?._id, fetchCourseQueries]);

  const openModal = (query) => {
    setSelectedQuery(query);
    setAnswer(query.answer || "");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedQuery(null);
    setAnswer("");
  };

  const updateQuery = async () => {
    if (!answer.trim()) return;
    setIsUpdating(true);
    try {
      const { data: updatedQuery } = await api.put(
        `/api/queries/${selectedQuery._id}`,
        {
          answer,
          status: "resolved",
        },
      );

      // 1. Optimistic update – reflect changes immediately
      updateQueryInList(updatedQuery);

      // 2. Fallback: refresh the whole course list silently (in case socket fails)
      await fetchCourseQueries(id, teacher?._id);

      closeModal();
    } catch (err) {
      console.error("Failed to update query:", err);
      // Optionally show a toast error here
    } finally {
      setIsUpdating(false);
    }
  };

  const pendingCount = courseQueries.filter(
    (q) => q.status === "pending",
  ).length;
  const resolvedCount = courseQueries.filter(
    (q) => q.status === "resolved",
  ).length;
  const totalCount = courseQueries.length;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50/50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2">
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => router.back()}
              icon={ArrowLeft}
            />
            <div>
              <h1
                className="text-3xl font-black text-gray-900 leading-tight"
                style={{ letterSpacing: "-0.03em" }}
              >
                Student Queries
              </h1>
              <p className="text-sm text-gray-400 font-medium mt-0.5">
                Manage and respond to student questions efficiently.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatsCard
            icon={MessageSquare}
            title="Total Queries"
            value={totalCount}
            color="bg-indigo-600"
            delay={100}
          />
          <StatsCard
            icon={Clock}
            title="Pending Requests"
            value={pendingCount}
            color="bg-amber-500"
            delay={200}
          />
          <StatsCard
            icon={CheckCircle}
            title="Resolved"
            value={resolvedCount}
            color="bg-emerald-600"
            delay={300}
          />
        </div>

        {/* Queries List */}
        <div className="bg-white rounded-4xl overflow-hidden premium-panel">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white text-gray-800">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <AlertCircle size={20} className="text-indigo-600" />
              Recent Inquiries
            </h2>
          </div>

          <div className="p-6">
            {isInitializing || loading ? (
              <Loading message="Fetching the latest queries..." />
            ) : courseQueries.length === 0 ? (
              <StateMessage
                icon={MessageSquare}
                title="No queries found"
                description="Students haven't asked any questions yet for this course."
              />
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {courseQueries.map((q) => (
                  <div
                    key={q._id}
                    className="group bg-white rounded-2xl border border-gray-100 p-5 hover:border-indigo-200 hover:shadow-md transition-all duration-300 relative overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                              q.status === "resolved"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {q.status}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(q.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-indigo-600 transition-colors">
                          {q.query}
                        </h3>

                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100/50">
                          <p className="text-sm font-medium text-gray-500 mb-1">
                            Teacher's Response:
                          </p>
                          <p className="text-gray-700 italic">
                            {q.answer || "Waiting for your response..."}
                          </p>
                        </div>
                      </div>

                      <Button
                        onClick={() => openModal(q)}
                        className="self-end sm:self-start"
                        size="md"
                        icon={Send}
                      >
                        Reply / Update
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reply Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
              onClick={closeModal}
            />
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="p-6 border-b border-gray-100 bg-indigo-50/50">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="p-2 bg-indigo-600 rounded-lg">
                    <MessageSquare size={18} className="text-white" />
                  </div>
                  Respond to Query
                </h2>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Student Query
                  </label>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                    <p className="text-gray-800 font-medium">
                      {selectedQuery?.query}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Your Response
                  </label>
                  <textarea
                    className="w-full border-2 border-gray-100 focus:border-indigo-500 focus:ring-0 p-4 rounded-2xl min-h-[120px] transition-all resize-none"
                    placeholder="Enter your clear and detailed answer here..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-6 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
                <Button
                  onClick={closeModal}
                  variant="ghost"
                  disabled={isUpdating}
                >
                  Discard Changes
                </Button>
                <Button
                  onClick={updateQuery}
                  isLoading={isUpdating}
                  disabled={!answer.trim() || isUpdating}
                >
                  Submit Response
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
