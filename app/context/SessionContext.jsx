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
import socket from "@/utils/socket";

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

  const fetchMeetings = useCallback(async () => {
    if (!teacher?._id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/api/session/teacher/${teacher._id}`);
      if (isMounted.current) {
        setMeetings(res.data || []);
      }
    } catch (err) {
      console.error("Error fetching meetings:", err);
      if (isMounted.current) {
        setError("Failed to load meetings.");
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [teacher?._id]);

  const fetchSlots = useCallback(async () => {
    if (!teacher?._id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/api/availability/${teacher._id}`);
      if (isMounted.current) {
        setSlots(res.data || []);
      }
    } catch (err) {
      console.error("Error fetching slots:", err);
      if (isMounted.current) {
        setError("Failed to load availability slots.");
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [teacher?._id]);

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

  const deleteSlot = async (id) => {
    try {
      // Optimistic delete
      const deletedSlot = slots.find((s) => s._id === id);
      setSlots((prev) => prev.filter((s) => s._id !== id));

      // Also remove any meetings associated with this slot
      if (deletedSlot && deletedSlot.is_booked) {
        setMeetings((prev) => prev.filter((m) => m.slot_id !== id));
      }

      await api.delete(`/api/availability/${id}`);
      // Socket will handle confirming the delete
    } catch (err) {
      console.error("Error deleting slot:", err);
      // Revert on error
      await fetchSlots();
      await fetchMeetings();
      throw err;
    }
  };

  const updateMeetingStatus = async (id, status) => {
    try {
      // Optimistic update
      setMeetings((prev) =>
        prev.map((m) =>
          m._id === id ? { ...m, status, updatedAt: new Date() } : m,
        ),
      );

      const res = await api.put(`/api/session/${id}`, { status });

      // Update with actual server response
      setMeetings((prev) => prev.map((m) => (m._id === id ? res.data : m)));
      return res.data;
    } catch (err) {
      console.error("Error updating status:", err);
      // Revert on error
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

  // Socket event listeners
  useEffect(() => {
    if (!teacher?._id) return;

    // Handle new session request from student
    const handleNewSessionRequest = (data) => {
      const { session, teacher_id, student_id } = data;
      if (teacher_id === teacher._id) {
        setMeetings((prev) => {
          if (prev.find((m) => m._id === session._id)) return prev;
          return [session, ...prev];
        });
      }
    };

    // Handle meeting status update
    const handleUpdateSessionStatus = (data) => {
      const { session, teacher_id, student_id } = data;
      if (teacher_id === teacher._id) {
        setMeetings((prev) =>
          prev.map((m) => (m._id === session._id ? session : m)),
        );
      }
    };

    // Handle slot update (when booked)
    const handleSlotUpdate = (updatedSlot) => {
      if (updatedSlot.teacher_id === teacher._id) {
        setSlots((prev) =>
          prev.map((s) => (s._id === updatedSlot._id ? updatedSlot : s)),
        );
      }
    };

    // Handle slot deletion with sessions
    const handleSlotDeletedWithSessions = (data) => {
      const { slotId, teacherId, sessionIds } = data;
      if (teacherId === teacher._id) {
        // Remove the slot
        setSlots((prev) => prev.filter((s) => s._id !== slotId));
        // Remove associated sessions
        setMeetings((prev) => prev.filter((m) => !sessionIds.includes(m._id)));
      }
    };

    // Handle new slot
    const handleNewSlot = (data) => {
      const { slot, teacherId } = data;
      if (teacherId === teacher._id) {
        setSlots((prev) => {
          if (prev.find((s) => s._id === slot._id)) return prev;
          return [...prev, slot];
        });
      }
    };

    // Handle slot deletion
    const handleDeleteSlot = (data) => {
      const { id, teacherId } = data;
      if (teacherId === teacher._id) {
        setSlots((prev) => prev.filter((s) => s._id !== id));
      }
    };

    // Register all socket events
    socket.on("new_session_request", handleNewSessionRequest);
    socket.on("update_session_status", handleUpdateSessionStatus);
    socket.on("slot_update", handleSlotUpdate);
    socket.on("slot_deleted_with_sessions", handleSlotDeletedWithSessions);
    socket.on("new_slot", handleNewSlot);
    socket.on("delete_slot", handleDeleteSlot);

    return () => {
      socket.off("new_session_request", handleNewSessionRequest);
      socket.off("update_session_status", handleUpdateSessionStatus);
      socket.off("slot_update", handleSlotUpdate);
      socket.off("slot_deleted_with_sessions", handleSlotDeletedWithSessions);
      socket.off("new_slot", handleNewSlot);
      socket.off("delete_slot", handleDeleteSlot);
    };
  }, [teacher]);

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
