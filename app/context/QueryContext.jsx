// context/QueryContext.jsx (Teacher Portal)
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

  // Fetch all queries (for teacher dashboard)
  const fetchAllQueries = useCallback(async () => {
    if (!teacher?._id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/api/queries/all`);
      const fetchedQueries = Array.isArray(res.data)
        ? res.data
        : res.data.queries || [];
      setQueries(fetchedQueries);
    } catch (err) {
      console.error("Fetch all queries failed:", err);
      setError("Failed to load queries.");
      setQueries([]);
    } finally {
      setLoading(false);
    }
  }, [teacher?._id]);

  // Fetch queries for a specific course (teacher view)
  const fetchCourseQueries = useCallback(
    async (courseId, teacherId) => {
      if (!teacherId || !courseId) return [];
      try {
        const res = await api.get(
          `/api/queries/teacher/${teacherId}/course/${courseId}`,
        );
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.queries || [];
        setQueries(data);
        return data;
      } catch (err) {
        console.error("Fetch course queries failed:", err);
        setError("Failed to load course queries.");
        return [];
      }
    },
    [], // ✅ no dependency on teacher?._id because teacherId is passed
  );

  // Optimistic UI updates (used after API calls)
  const addQuery = (newQuery) => {
    setQueries((prev) => {
      if (prev.find((q) => q._id === newQuery._id)) return prev;
      return [newQuery, ...prev];
    });
  };

  const updateQueryInList = (updatedQuery) => {
    setQueries((prev) =>
      prev.map((q) => (q._id === updatedQuery._id ? updatedQuery : q)),
    );
  };

  // Initial load
  useEffect(() => {
    if (teacher?._id) {
      fetchAllQueries();
    } else {
      setQueries([]);
      setLoading(false);
    }
  }, [teacher?._id, fetchAllQueries]);

  // ✅ Socket listeners for real‑time updates (create, update, delete)
  useEffect(() => {
    if (!teacher?._id) return;
    if (!socket.connected) socket.connect();

    const handleNewQuery = (query) => {
      // Only add if it belongs to a course taught by this teacher (optional filter)
      // For now, add all – backend may already restrict.
      setQueries((prev) => {
        if (prev.find((q) => q._id === query._id)) return prev;
        return [query, ...prev];
      });
    };

    const handleUpdateQuery = (updatedQuery) => {
      setQueries((prev) =>
        prev.map((q) => (q._id === updatedQuery._id ? updatedQuery : q)),
      );
    };

    const handleDeleteQuery = ({ id }) => {
      setQueries((prev) => prev.filter((q) => q._id !== id));
    };

    socket.on("new_query", handleNewQuery);
    socket.on("update_query", handleUpdateQuery);
    socket.on("delete_query", handleDeleteQuery);

    return () => {
      socket.off("new_query", handleNewQuery);
      socket.off("update_query", handleUpdateQuery);
      socket.off("delete_query", handleDeleteQuery);
    };
  }, [teacher?._id]);

  return (
    <QueryContext.Provider
      value={{
        queries,
        loading,
        error,
        fetchAllQueries,
        fetchCourseQueries,
        addQuery,
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
