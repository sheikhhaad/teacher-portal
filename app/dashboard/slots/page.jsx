"use client";
import React, { useState } from "react";
import { useSession } from "@/app/context/SessionContext";
import {
  Calendar,
  Clock,
  Video,
  Plus,
  Trash2,
  AlertCircle,
  LayoutGrid,
} from "lucide-react";
import SlotModal from "@/component/SlotModal";
import Loading from "@/component/Loading";
import ErrorMessage from "@/component/Error";
import Button from "@/component/Button";
import { useRouter } from "next/navigation";

export default function SlotsPage() {
  const router = useRouter();
  const { slots, loading, error, deleteSlot } = useSession();
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);

  const openSlotModal = () => setIsSlotModalOpen(true);
  const closeSlotModal = () => setIsSlotModalOpen(false);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="h-full p-4 sm:p-6 lg:p-10 bg-[#f7f7fb]">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-indigo-400 mb-0.5">
              Management
            </p>
            <h1
              className="text-3xl font-black text-gray-900 leading-tight"
              style={{ letterSpacing: "-0.03em" }}
            >
              Availability Slots
            </h1>
            <p className="text-sm text-gray-400 font-medium mt-0.5">
              Set your available times for student bookings
            </p>
          </div>
          <Button variant="primary" onClick={openSlotModal} icon={Plus}>
            Add New Slot
          </Button>
        </div>

        <SlotModal isOpen={isSlotModalOpen} onClose={closeSlotModal} />

        {/* Content */}
        <div className="premium-panel bg-white rounded-[2rem] overflow-hidden p-6 lg:p-8 shadow-sm border border-gray-100">
          {loading ? (
            <div className="py-20">
              <Loading message="Fetching your slots..." />
            </div>
          ) : slots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div
                className="w-24 h-24 rounded-3xl flex items-center justify-center"
                style={{
                  background: "#f5f5ff",
                  border: "1.5px dashed #c7c7e8",
                }}
              >
                <Calendar size={36} className="text-indigo-200" />
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-gray-800">
                  No slots found
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  You haven't created any availability slots yet.
                </p>
                <Button
                  variant="primary"
                  onClick={openSlotModal}
                  icon={Plus}
                  className="mt-6"
                >
                  Create Your First Slot
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {slots.map((slot) => (
                <div
                  key={slot._id}
                  className="group relative bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-wider">
                      {slot.day}
                    </div>
                    <div
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                        slot.isBooked
                          ? "bg-rose-50 text-rose-600"
                          : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {slot.isBooked ? "Booked" : "Available"}
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                        <Clock size={16} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                          Time range
                        </p>
                        <p className="text-sm font-bold text-gray-700">
                          {slot.start_time} - {slot.end_time}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                        <Calendar size={16} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                          Date
                        </p>
                        <p className="text-sm font-bold text-gray-700">
                          {slot.date}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => deleteSlot(slot._id)}
                    variant="danger"
                    size="sm"
                    className="w-full justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    icon={Trash2}
                  >
                    Remove Slot
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
