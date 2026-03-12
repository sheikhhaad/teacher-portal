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

const QueryContext = createContext();

export function QueryProvider({ children }) {
  const { teacher } = useTeacher();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all queries of logged student
  const fetchAllQueries = useCallback(async () => {
    if (!teacher?._id) return;

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

  // Fetch course specific queries
  const fetchCourseQueries = useCallback(
    async (courseId, teacherId) => {
      if (!teacherId || !courseId) return [];
      try {
        const res = await api.get(
          `/api/queries/teacher/${teacherId}/course/${courseId}`,
        );
        return Array.isArray(res.data) ? res.data : res.data.queries || [];
      } catch (err) {
        console.error("Fetch course queries failed:", err);
        setError("Failed to load course queries.");
        return [];
      }
    },
    [teacher?._id],
  );

  // Add new query in state
  const addQuery = (newQuery) => {
    setQueries((prev) => [newQuery, ...prev]);
  };

  // Update single query in state
  const updateQueryInList = (updatedQuery) => {
    setQueries((prev) =>
      prev.map((q) => (q._id === updatedQuery._id ? updatedQuery : q)),
    );
  };

  useEffect(() => {
    if (teacher?._id) {
      fetchAllQueries();
    } else {
      setQueries([]);
    }
  }, [teacher?._id, fetchAllQueries]);

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
