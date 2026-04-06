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
import { socket } from "@/utils/socket";

const QueryContext = createContext();

export function QueryProvider({ children }) {
  const { teacher } = useTeacher();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch queries for a specific course
  const fetchCourseQueries = useCallback(async (courseId, teacherId) => {
    if (!teacherId || !courseId) return [];
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(
        `/api/queries/teacher/${teacherId}/course/${courseId}`
      );
      const data = Array.isArray(res.data) ? res.data : res.data.queries || [];
      setQueries(data);
      return data;
    } catch (err) {
      console.error("Fetch course queries failed:", err);
      setError("Failed to load course queries.");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Optimistic UI update after API reply
  const updateQueryInList = useCallback((updatedQuery) => {
    setQueries((prev) =>
      prev.map((q) => (q._id === updatedQuery._id ? updatedQuery : q))
    );
  }, []);

  // Reset when teacher logs out
  useEffect(() => {
    if (!teacher?._id) {
      setQueries([]);
      setLoading(false);
    }
  }, [teacher?._id]);

  // Socket listeners – only new_query and delete_query
  useEffect(() => {
    if (!teacher?._id) return;

    const handleConnect = () => {
      console.log("✅ Teacher socket connected");
    };

    const handleDisconnect = (reason) => {
      console.warn("⚠️ Teacher socket disconnected:", reason);
    };

    const handleNewQuery = (newQuery) => {
      console.log("📩 New query received via socket:", newQuery);
      setQueries((prev) => {
        if (prev.find((q) => q._id === newQuery._id)) return prev;
        return [newQuery, ...prev]; // newest first
      });
    };

    const handleDeleteQuery = ({ id }) => {
      console.log("🗑️ Query deleted via socket:", id);
      setQueries((prev) => prev.filter((q) => q._id !== id));
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("new_query", handleNewQuery);
    socket.on("delete_query", handleDeleteQuery);

    if (!socket.connected) {
      socket.connect();
    } else {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("new_query", handleNewQuery);
      socket.off("delete_query", handleDeleteQuery);
    };
  }, [teacher?._id]);

  return (
    <QueryContext.Provider
      value={{
        queries,
        loading,
        error,
        fetchCourseQueries,
        updateQueryInList,
      }}
    >
      {children}
    </QueryContext.Provider>
  );
}

export function useQueries() {
  const context = useContext(QueryContext);
  if (!context) throw new Error("useQueries must be used within QueryProvider");
  return context;
}