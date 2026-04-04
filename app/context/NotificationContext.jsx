"use client";

import { createContext, useContext, useEffect, useState } from "react";
import socket from "@/utils/socket";
import { useTeacher } from "./AuthContext";
import { useEnrollMent } from "./EnrollStuContext";
import toast from "react-hot-toast";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { teacher } = useTeacher();
  const { teacherEnrollments } = useEnrollMent();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!teacher?._id) {
      if (socket.connected) {
        socket.disconnect();
      }
      setIsConnected(false);
      return;
    }

    // Connect socket if not connected
    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => {
      setIsConnected(true);
      if (teacher?._id) {
        console.log("Socket connected, joining rooms for teacher:", teacher._id);
        // Join the authenticated user's individual room
        socket.emit("join", teacher._id);
        socket.emit("join_user", teacher._id); 
        socket.emit("join_teacher", teacher._id); 
        
        // Join a global teachers room
        socket.emit("join", "teachers");

        // Join all possible chat rooms globally to receive messages on all pages
        if (teacherEnrollments && teacherEnrollments.length > 0) {
          teacherEnrollments.forEach((enroll) => {
            const studentId = enroll.student_id?._id || enroll.student_id;
            if (studentId) {
              const chatId = `${studentId}_${teacher._id}`;
              socket.emit("join_chat", chatId);
            }
          });
        }
      }
    };

    const onDisconnect = () => {
      setIsConnected(false);
      console.log("Socket disconnected");
    };

    const onNewQuery = (query) => {
      toast.success("New query received from student!", { id: `new-query-${query._id}` });
    };

    const onUpdateQuery = (query) => {
      toast(`Query updated: ${query.status}`, { id: `update-query-${query._id}` });
    };

    const onNewSessionRequest = (data) => {
      toast.success("New session booking request!", { id: `new-session-${data.session?._id || "req"}` });
    };

    const onUpdateSessionStatus = (data) => {
      toast(`Session status updated: ${data.session.status}`, { id: `update-session-${data.session._id}` });
    };
    
    const onSlotDeleted = (data) => {
      toast.error("A slot was deleted.", { id: "slot-deleted" });
    };

    const onReceiveMessage = (msg) => {
      if (msg.sender_role !== "teacher") {
        toast.success(`New message: ${msg.message?.substring(0, 30)}${msg.message?.length > 30 ? "..." : ""}`, { 
          id: `msg-${msg._id || Date.now()}`,
          duration: 4000
        });
      }
    };
    
    const onReceiveQueryMessage = (msg) => {
      if (msg.sender_role !== "teacher") {
        toast.success(`Query Update: ${msg.message?.substring(0, 30)}...`, { 
          id: `query-msg-${msg._id}`,
          duration: 4000
        });
      }
    };

    const onNewAnnouncement = (announcement) => {
      toast.success("A new announcement has been posted!", { id: `announcement-${announcement._id}` });
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("new_query", onNewQuery);
    socket.on("update_query", onUpdateQuery);
    socket.on("new_session_request", onNewSessionRequest);
    socket.on("update_session_status", onUpdateSessionStatus);
    socket.on("delete_slot", onSlotDeleted);
    socket.on("receive_message", onReceiveMessage);
    socket.on("receive_query_message", onReceiveQueryMessage);
    socket.on("new_announcement", onNewAnnouncement);

    // If already connected, join rooms manually
    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("new_query", onNewQuery);
      socket.off("update_query", onUpdateQuery);
      socket.off("new_session_request", onNewSessionRequest);
      socket.off("update_session_status", onUpdateSessionStatus);
      socket.off("delete_slot", onSlotDeleted);
      socket.off("receive_message", onReceiveMessage);
      socket.off("receive_query_message", onReceiveQueryMessage);
      socket.off("new_announcement", onNewAnnouncement);
    };
  }, [teacher?._id, teacherEnrollments]);

  return (
    <NotificationContext.Provider value={{ isConnected }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
