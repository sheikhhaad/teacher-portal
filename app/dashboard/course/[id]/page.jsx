"use client";
import { useTeacher } from "@/app/context/AuthContext";
import { useQueries } from "@/app/context/QueryContext";
import api from "@/utils/api";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Plus,
  Video,
  ArrowLeft,
  Megaphone,
} from "lucide-react";
import StatsCard from "@/component/StatsCard";
import Button from "@/component/Button";
import Loading from "@/component/Loading";
import StateMessage from "@/component/StateMessage";
import AnnouncementModal from "@/component/AnnouncementModal";
import ErrorMessage from "@/component/Error";
import { useRouter } from "next/navigation";

const Page = () => {
  const { id } = useParams();
  const { teacher } = useTeacher();
  const router = useRouter();
  const { queries, loading, error, fetchCourseQueries } = useQueries();
  const [localQueries, setLocalQueries] = useState([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState("pending");
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAnnouncementSubmit = async (data) => {
    try {
      await api.post(`/api/announcements/create`, {
        teacher_id: teacher._id,
        course_id: id,
        text: data.description,
      });
      setIsAnnouncementOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const initQueries = async () => {
      setIsInitializing(true);
      const data = await fetchCourseQueries(id, teacher?._id);
      console.log(data);

      setLocalQueries(data);
      setIsInitializing(false);
    };
    initQueries();
  }, [id, fetchCourseQueries, teacher?._id]);

  const openModal = (query) => {
    setSelectedQuery(query);
    setAnswer(query.answer || "");
    setStatus(query.status || "pending");
    setModalOpen(true);
  };

  const updateQuery = async () => {
    setIsUpdating(true);
    try {
      await api.put(`/api/queries/${selectedQuery._id}`, {
        answer,
        status,
      });

      setModalOpen(false);

      const updatedData = await fetchCourseQueries(id, teacher?._id);
      setLocalQueries(updatedData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const pendingCount = localQueries.filter(
    (q) => q.status === "pending",
  ).length;
  const resolvedCount = localQueries.filter(
    (q) => q.status === "resolved",
  ).length;
  const totalCount = localQueries.length;

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
        {/* Header Section */}
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

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => setIsAnnouncementOpen(true)}
              icon={Megaphone}
            >
              Make An Announcement
            </Button>
          </div>
        </div>
        {/* Stats Grid */}
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

        {/* Content Section */}
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
            ) : localQueries.length === 0 ? (
              <StateMessage
                icon={MessageSquare}
                title="No queries found"
                description="Students haven't asked any questions yet for this course."
              />
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {localQueries.map((q, idx) => (
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
                      <Button
                        onClick={() => router.push(`/dashboard/chat/${q._id}/`)}
                        className="self-end sm:self-start"
                        size="md"
                        icon={MessageSquare}
                      >
                        Discuss
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
              onClick={() => setModalOpen(false)}
            ></div>

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
                    className="w-full border-2 border-gray-100 focus:border-indigo-500 focus:ring-0 p-4 rounded-2xl min-h-[120px] transition-all"
                    placeholder="Enter your clear and detailed answer here..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Update Status
                  </label>
                  <select
                    className="w-full border-2 border-gray-100 focus:border-indigo-500 focus:ring-0 p-4 rounded-2xl transition-all appearance-none bg-no-repeat bg-[right_1.25rem_center] bg-[length:1em_1em]"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    }}
                  >
                    <option value="pending">⏳ Stay Pending</option>
                    <option value="resolved">✅ Mark as Resolved</option>
                  </select>
                </div>
              </div>

              <div className="p-6 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
                <Button
                  onClick={() => setModalOpen(false)}
                  variant="ghost"
                  disabled={isUpdating}
                >
                  Discard Changes
                </Button>

                <Button onClick={updateQuery} isLoading={isUpdating}>
                  Submit Response
                </Button>
              </div>
            </div>
          </div>
        )}

        <AnnouncementModal
          isOpen={isAnnouncementOpen}
          onClose={() => setIsAnnouncementOpen(false)}
          onSubmit={handleAnnouncementSubmit}
        />
      </div>
    </div>
  );
};

export default Page;
