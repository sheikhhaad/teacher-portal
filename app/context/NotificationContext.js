"use client";

import { socket } from "@/utils/socket";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

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
      const formatted = {
        id: data._id,
        type,
        text: data.message || data.query || data.text || "New Notification",
        time: data.createdAt,
        read: false, // unread by defaul
      };

      setNotifications((prev) => [formatted, ...prev]);

      // Toast per type
      if (type === "session_booked") toast.success("New Session Booked");
      else if (type === "new_query") toast.success("New Query Reply from Teacher");
      else if (type === "new_message") toast.success("New Message from Teacher");
    };

    socket.on("session_booked", (d) => handleNew(d, "session_booked"));
    socket.on("new_query", (d) => handleNew(d, "new_query"));
    socket.on("new_message", (d) => handleNew(d, "new_message"));

    return () => {
      socket.off("session_booked");
      socket.off("new_query");
      socket.off("new_message");
    };
  }, []);

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
