// context/ChatContext.jsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import api from "@/utils/api";
import { useTeacher } from "./AuthContext";
import socket from "@/utils/socket";
import toast from "react-hot-toast";

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { teacher } = useTeacher();

  // ✅ Track the active chat_id in a ref so the socket handler
  // can read the latest value without being a stale closure
  const activeChatIdRef = useRef(null);

  const fetchMessages = useCallback(
    async (studentId) => {
      if (!studentId || !teacher?._id) return;

      const newChatId = `${studentId}_${teacher._id}`;
      
      // Leave previous room if exists
      if (activeChatIdRef.current && activeChatIdRef.current !== newChatId) {
        socket.emit("leave_chat", activeChatIdRef.current);
      }

      // ✅ Set active chat and join server room
      activeChatIdRef.current = newChatId;
      socket.emit("join_chat", newChatId);

      try {
        setLoading(true);
        const res = await api.get(`/api/messages/${studentId}/${teacher._id}`);
        setMessages(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    },
    [teacher?._id],
  );


  const sendMessage = async (studentId, messageText) => {
    if (!messageText.trim() || !studentId || !teacher?._id) return false;

    // ✅ Optimistic update — message appears instantly without waiting
    // for the server round-trip
    const optimisticMsg = {
      _id: `temp_${Date.now()}`,
      chat_id: `${studentId}_${teacher._id}`,
      sender_id: teacher._id,
      sender_role: "teacher",
      message: messageText,
      createdAt: new Date().toISOString(),
      _isOptimistic: true,
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      setSending(true);
      const res = await api.post("/api/messages/send", {
        sender_id: teacher._id,
        sender_role: "teacher",
        student_id: studentId,
        teacher_id: teacher._id,
        message: messageText,
      });

      const savedMsg = res.data?.data || res.data;

      // ✅ Replace optimistic message with the real saved one
      setMessages((prev) =>
        prev.map((m) => (m._id === optimisticMsg._id ? savedMsg : m)),
      );

      // ✅ No fetchMessages call — socket "receive_message" will handle
      // incoming messages from the other side. We already have our own.
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      // ✅ Roll back optimistic message on failure
      setMessages((prev) => prev.filter((m) => m._id !== optimisticMsg._id));
      return false;
    } finally {
      setSending(false);
    }
  };

  const clearMessages = () => {
    if (activeChatIdRef.current) {
      socket.emit("leave_chat", activeChatIdRef.current);
    }
    setMessages([]);
    activeChatIdRef.current = null; // ✅ clear active chat on unmount
  };


  // ✅ Socket connection management
  // Connection and 'join' (user room) are now handled by NotificationContext
  useEffect(() => {
    const handleReceiveMessage = (newMessage) => {
      // Safeguard: Ignore messages not belonging to the currently open chat
      if (
        activeChatIdRef.current &&
        newMessage.chat_id !== activeChatIdRef.current
      ) {
        return;
      }

      // State update is still needed
      setMessages((prev) => {
        // Deduplicate
        if (prev.find((m) => m._id === newMessage._id)) return prev;
        return [...prev, newMessage];
      });
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, []); // Teacher logic moved to NotificationContext


  return (
    <ChatContext.Provider
      value={{
        messages,
        loading,
        sending,
        fetchMessages,
        sendMessage,
        clearMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
}
