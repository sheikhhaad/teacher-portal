"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "@/app/context/SessionContext";
import {
  Video,
  Clock,
  CheckCircle,
  ArrowLeft,
  Plus,
  RefreshCw,
} from "lucide-react";
import StatsCard from "@/component/StatsCard";
import { useRouter } from "next/navigation";
import MeetingCard from "@/component/MeetingCard";
import Loading from "@/component/Loading";
import ErrorMessage from "@/component/Error";
import Button from "@/component/Button";

const FILTERS = ["all", "pending", "accepted", "completed"];

export default function MeetingsPage() {
  const router = useRouter();
  const { meetings, loading, error, updateMeetingStatus, fetchMeetings } =
    useSession();

  const [filter, setFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMeetings();
    setRefreshing(false);
  };

  const handleStatusUpdate = async (id) => {
    setUpdatingId(id);
    try {
      await updateMeetingStatus(id, "accepted");
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage message={error} />
      </div>
    );
  }

  const filtered = meetings.filter(
    (m) => filter === "all" || m.status === filter,
  );

  const stats = {
    total: meetings.length,
    pending: meetings.filter((m) => m.status === "pending").length,
    completed: meetings.filter((m) =>
      ["completed", "resolved"].includes(m.status),
    ).length,
  };

  return (
    <div className="h-full p-4 sm:p-6 lg:p-10 bg-[#f7f7fb]">
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
              <p className="text-[11px] font-black uppercase tracking-widest text-indigo-400 mb-0.5">
                Teacher Dashboard
              </p>
              <h1
                className="text-3xl font-black text-gray-900 leading-tight"
                style={{ letterSpacing: "-0.03em" }}
              >
                Scheduled Meetings
              </h1>
              <p className="text-sm text-gray-400 font-medium mt-0.5">
                Manage your upcoming Zoom sessions with students
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handleRefresh}
              icon={RefreshCw}
              disabled={refreshing}
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
            <Button
              variant="primary"
              onClick={() => router.push("/dashboard/slots")}
              icon={Plus}
            >
              Add Availability Slots
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard
            icon={Video}
            label="Total Sessions"
            value={stats.total}
            accent="#6366f1"
          />
          <StatsCard
            icon={Clock}
            label="Pending Approval"
            value={stats.pending}
            accent="#f59e0b"
          />
          <StatsCard
            icon={CheckCircle}
            label="Completed"
            value={stats.completed}
            accent="#10b981"
          />
        </div>

        {/* Meetings List */}
        <div className="bg-white rounded-3xl overflow-hidden premium-panel shadow-sm border border-gray-100">
          {/* Filter Toolbar */}
          <div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-8 py-5"
            style={{ borderBottom: "1.5px solid #f0f0f8" }}
          >
            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-2xl">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="px-4 py-2 rounded-xl text-xs font-black capitalize transition-all"
                  style={
                    filter === f
                      ? {
                          background: "white",
                          color: "#6366f1",
                          boxShadow: "0 1px 6px 0 rgba(99,102,241,.15)",
                        }
                      : { color: "#9ca3af" }
                  }
                >
                  {f}
                  {f !== "all" && (
                    <span
                      className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px]"
                      style={{
                        background: filter === f ? "#eef2ff" : "#f3f4f6",
                        color: filter === f ? "#6366f1" : "#9ca3af",
                      }}
                    >
                      {meetings.filter((m) => m.status === f).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="p-6 lg:p-8">
            {loading && meetings.length === 0 ? (
              <Loading message="Loading sessions…" />
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div
                  className="w-24 h-24 rounded-3xl flex items-center justify-center"
                  style={{
                    background: "#f5f5ff",
                    border: "1.5px dashed #c7c7e8",
                  }}
                >
                  <Video size={36} className="text-indigo-200" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-gray-800">
                    No sessions found
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {filter === "all"
                      ? "You have no scheduled sessions yet."
                      : `No ${filter} sessions at the moment.`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filtered.map((meeting) => (
                  <MeetingCard
                    key={meeting._id}
                    meeting={meeting}
                    onAccept={handleStatusUpdate}
                    isUpdating={updatingId === meeting._id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
