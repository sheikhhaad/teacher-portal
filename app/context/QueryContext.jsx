// context/QueryContext.jsx
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
import socket from "@/utils/socket";
import toast from "react-hot-toast";

const QueryContext = createContext();

export function QueryProvider({ children }) {
  const { teacher } = useTeacher();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  // ✅ Now populates context queries so socket diffs work
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
        setQueries(data); // ✅ populate context so socket updates can diff correctly
        return data;
      } catch (err) {
        console.error("Fetch course queries failed:", err);
        setError("Failed to load course queries.");
        return [];
      }
    },
    [teacher?._id],
  );

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

  useEffect(() => {
    if (teacher?._id) {
      fetchAllQueries();
    } else {
      setQueries([]);
    }
  }, [teacher?._id, fetchAllQueries]);

  // ✅ Socket listeners — removed broken teacher.course_id filter
  useEffect(() => {
    if (!teacher?._id) return;

    const handleNewQuery = (query) => {
      // Assuming teacher query logic - only toast for new ones that enter state
      setQueries((prev) => {
        if (prev.find((q) => q._id === query._id)) return prev;

        // Use a timeout or move toast fully outside
        // Moving outside: could get duplicate toasts if socket sends twice,
        // but better than breaking React render rules.
        setTimeout(() => toast.success("New student query received!"), 0);

        return [query, ...prev];
      });
    };

    const handleUpdateQuery = (updatedQuery) => {
      setQueries((prev) => {
        const index = prev.findIndex((q) => q._id === updatedQuery._id);
        if (index > -1) {
          setTimeout(() => toast.success("A query has been updated."), 0);
          const newQueries = [...prev];
          newQueries[index] = updatedQuery;
          return newQueries;
        }
        return prev;
      });
    };

    const handleDeleteQuery = ({ _id }) => {
      setQueries((prev) => prev.filter((q) => q._id !== _id));
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
