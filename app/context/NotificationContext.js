"use client";

import { socket } from "@/utils/socket";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { useTeacher } from "./AuthContext";
import { usePathname } from "next/navigation";

const shouldShowNotification = (currentPath, notificationPage) => {
  if (!notificationPage) return true;
  // Normalize paths by removing trailing slashes and ensuring they start with /
  const normalize = (p) => p.replace(/\/+$/, "") || "/";
  return normalize(currentPath) !== normalize(notificationPage);
};

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { teacher } = useTeacher();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);


  // Load saved notifications from localStorage (client-side only)
  useEffect(() => {
    const saved = localStorage.getItem("notifications");
    if (saved) setNotifications(JSON.parse(saved));
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  // Socket listeners
  useEffect(() => {
    const handleRemove = (data, type) => {
      setNotifications((prev) => prev.filter((n) => n.id !== data._id));
    };
    const handleNew = (data, type) => {
      // 1. Ignore if sender is the current teacher (self-notification)
      if (teacher?._id && (data.sender_id === teacher._id || data.teacher_id === teacher._id && type === "new_message" && data.sender_role === "teacher")) {
        return;
      }

      // 2. Resolve target page with fallbacks
      let targetPage = data.page || data.targetRoute;
      if (!targetPage) {
        if (type === "new_message" || type === "new_query") {
          targetPage = `/dashboard/chat/${data.query_id || data.student_id || ""}`;
        } else if (type === "session_booked") {
          targetPage = "/dashboard/meetings";
        }
      }

      const formatted = {
        id: data._id,
        type,
        text: data.message || data.query || data.text || "New Notification",
        time: data.createdAt,
        read: false, // unread by defaul
        page: targetPage,
      };

      setNotifications((prev) => [formatted, ...prev]);

      // 3. Toast per type if not on the relevant page
      if (shouldShowNotification(pathnameRef.current, targetPage)) {
        if (type === "session_booked") toast.success("New Session Booked");
        else if (type === "new_query") toast.success("New Student Query Arrival");
        else if (type === "new_message") toast.success("New Message Arrival");
      }
    };

    socket.on("session_booked", (d) => handleNew(d, "session_booked"));
    socket.on("new_query", (d) => handleNew(d, "new_query"));
    socket.on("new_message", (d) => handleNew(d, "new_message"));

    return () => {
      socket.off("session_booked");
      socket.off("new_query");
      socket.off("new_message");
    };
  }, [teacher?._id]);

  // Mark single notification as read
  const markAsRead = (id) => {
    localStorage.removeItem("notifications");
    setNotifications([]);
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    localStorage.removeItem("notifications");
    setNotifications([]);
  };

  // Count of unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, markAsRead, markAllAsRead, unreadCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
