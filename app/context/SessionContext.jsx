"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import api from "@/utils/api";
import { useTeacher } from "./AuthContext";
import { socket } from "@/utils/socket"; // ✅ import socket

const SessionContext = createContext();

export function SessionProvider({ children }) {
  const { teacher } = useTeacher();
  const [meetings, setMeetings] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Fetch all meetings (sessions) for this teacher
  const fetchMeetings = useCallback(async () => {
    if (!teacher?._id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/api/session/teacher/${teacher._id}`);
      if (isMounted.current) setMeetings(res.data || []);
    } catch (err) {
      console.error("Error fetching meetings:", err);
      if (isMounted.current) setError("Failed to load meetings.");
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [teacher?._id]);

  // Fetch availability slots for this teacher
  const fetchSlots = useCallback(async () => {
    if (!teacher?._id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/api/availability/${teacher._id}`);
      if (isMounted.current) setSlots(res.data || []);
    } catch (err) {
      console.error("Error fetching slots:", err);
      if (isMounted.current) setError("Failed to load availability slots.");
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [teacher?._id]);

  // Add a new availability slot
  const addSlot = async (slotData) => {
    try {
      const res = await api.post(`/api/availability/create`, slotData);
      setSlots((prev) => {
        if (prev.find((s) => s._id === res.data._id)) return prev;
        return [...prev, res.data];
      });
      return res.data;
    } catch (err) {
      console.error("Error adding slot:", err);
      throw err;
    }
  };

  // Delete a slot (and its associated sessions)
  const deleteSlot = async (id) => {
    try {
      // Optimistic delete
      const deletedSlot = slots.find((s) => s._id === id);
      setSlots((prev) => prev.filter((s) => s._id !== id));
      if (deletedSlot?.is_booked) {
        setMeetings((prev) => prev.filter((m) => m.slot_id !== id));
      }
      await api.delete(`/api/availability/${id}`);
    } catch (err) {
      console.error("Error deleting slot:", err);
      // Revert on error
      await fetchSlots();
      await fetchMeetings();
      throw err;
    }
  };

  // Update meeting status (accept/reject/cancel)
  const updateMeetingStatus = async (id, status) => {
    try {
      // Optimistic update
      setMeetings((prev) =>
        prev.map((m) =>
          m._id === id ? { ...m, status, updatedAt: new Date() } : m
        )
      );
      const res = await api.put(`/api/session/update/${id}`, { status });
      setMeetings((prev) => prev.map((m) => (m._id === id ? res.data : m)));
      return res.data;
    } catch (err) {
      console.error("Error updating status:", err);
      await fetchMeetings();
      throw err;
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (teacher?._id) {
      fetchMeetings();
      fetchSlots();
    }
  }, [fetchMeetings, fetchSlots, teacher?._id]);

  // ✅ Real‑time socket listeners (matches backend events)
  useEffect(() => {
    if (!teacher?._id) return;
    if (!socket.connected) socket.connect();

    // New session request (student booked a slot)
    const handleSessionBooked = (session) => {
      if (session.teacher_id === teacher._id) {
        setMeetings((prev) => {
          if (prev.find((m) => m._id === session._id)) return prev;
          return [session, ...prev];
        });
        // Also update the corresponding slot to booked
        setSlots((prev) =>
          prev.map((s) =>
            s._id === session.slot_id ? { ...s, is_booked: true } : s
          )
        );
      }
    };

    // Session status updated (accepted/rejected/cancelled)
    const handleSessionUpdated = (session) => {
      if (session.teacher_id === teacher._id) {
        setMeetings((prev) =>
          prev.map((m) => (m._id === session._id ? session : m))
        );
      }
    };

    // Session deleted (when a slot is deleted)
    const handleSessionDeleted = ({ id }) => {
      setMeetings((prev) => prev.filter((m) => m._id !== id));
    };

    // Slot deleted (emitted by backend)
    const handleSlotDeleted = ({ slotId }) => {
      setSlots((prev) => prev.filter((s) => s._id !== slotId));
    };

    socket.on("session_booked", handleSessionBooked);
    socket.on("session_updated", handleSessionUpdated);
    socket.on("session_deleted", handleSessionDeleted);
    socket.on("slot_deleted", handleSlotDeleted);

    return () => {
      socket.off("session_booked", handleSessionBooked);
      socket.off("session_updated", handleSessionUpdated);
      socket.off("session_deleted", handleSessionDeleted);
      socket.off("slot_deleted", handleSlotDeleted);
    };
  }, [teacher?._id]);

  const value = {
    meetings,
    slots,
    loading,
    error,
    fetchMeetings,
    fetchSlots,
    addSlot,
    deleteSlot,
    updateMeetingStatus,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context)
    throw new Error("useSession must be used within SessionProvider");
  return context;
}