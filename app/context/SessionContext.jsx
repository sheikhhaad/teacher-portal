"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "@/utils/api";
import { useTeacher } from "./AuthContext";

const SessionContext = createContext();

export function SessionProvider({ children }) {
  const { teacher } = useTeacher();
  const [meetings, setMeetings] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMeetings = useCallback(async () => {
    if (!teacher?._id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/api/session/teacher/${teacher._id}`);
      setMeetings(res.data || []);
    } catch (err) {
      console.error("Error fetching meetings:", err);
      setError("Failed to load meetings.");
    } finally {
      setLoading(false);
    }
  }, [teacher?._id]);

  const fetchSlots = useCallback(async () => {
    if (!teacher?._id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/api/availability/${teacher._id}`);
      setSlots(res.data || []);
    } catch (err) {
      console.error("Error fetching slots:", err);
      setError("Failed to load availability slots.");
    } finally {
      setLoading(false);
    }
  }, [teacher?._id]);

  const addSlot = async (slotData) => {
    try {
      const res = await api.post(`/api/availability/create`, slotData);
      setSlots((prev) => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error("Error adding slot:", err);
      throw err;
    }
  };

  const deleteSlot = async (id) => {
    try {
      await api.delete(`/api/availability/${id}`);
      setSlots((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Error deleting slot:", err);
      throw err;
    }
  };

  const updateMeetingStatus = async (id, status) => {
    try {
      const res = await api.put(`/api/session/${id}`, { status });
      setMeetings((prev) => prev.map((m) => (m._id === id ? res.data : m)));
      return res.data;
    } catch (err) {
      console.error("Error updating status:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchMeetings();
    fetchSlots();
  }, [fetchMeetings, fetchSlots]);

  return (
    <SessionContext.Provider
      value={{
        meetings,
        slots,
        loading,
        error,
        fetchMeetings,
        fetchSlots,
        addSlot,
        deleteSlot,
        updateMeetingStatus,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context)
    throw new Error("useSession must be used within SessionProvider");
  return context;
}
