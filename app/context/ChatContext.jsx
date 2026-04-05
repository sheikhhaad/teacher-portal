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
import { socket } from "@/utils/socket";

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const { teacher } = useTeacher();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const currentStudentIdRef = useRef(null); // track active chat to filter messages

  // Fetch messages for a specific student
  const fetchMessages = useCallback(
    async (studentId) => {
      if (!studentId || !teacher?._id) return;

      try {
        setLoading(true);
        const res = await api.get(`/api/messages/${studentId}/${teacher._id}`);
        const fetchedMessages = Array.isArray(res.data) ? res.data : [];
        setMessages(fetchedMessages);
        currentStudentIdRef.current = studentId;
      } catch (error) {
        console.error("Error fetching messages:", error);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    },
    [teacher?._id]
  );

  // Send a new message (optimistic update)
  const sendMessage = async (studentId, messageText) => {
    if (!messageText.trim() || !studentId || !teacher?._id) return false;

    const chatId = `${studentId}_${teacher._id}`;
    const optimisticMsg = {
      _id: `temp_${Date.now()}`,
      chat_id: chatId,
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
      // Replace optimistic with real message
      setMessages((prev) =>
        prev.map((m) => (m._id === optimisticMsg._id ? savedMsg : m))
      );
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => prev.filter((m) => m._id !== optimisticMsg._id));
      return false;
    } finally {
      setSending(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    currentStudentIdRef.current = null;
  };

  // ✅ Real‑time socket listener – global "new_message" event, filtered by active chat
useEffect(() => {
  if (!teacher?._id) return;
  if (!socket.connected) socket.connect();

  const handleNewMessage = (newMessage) => {
    // ✅ Ignore messages sent by this teacher (already handled optimistically)
    if (newMessage.sender_id === teacher._id) return;

    const activeChatId = currentStudentIdRef.current
      ? `${currentStudentIdRef.current}_${teacher._id}`
      : null;
    if (newMessage.chat_id === activeChatId) {
      setMessages((prev) => {
        if (prev.find((m) => m._id === newMessage._id)) return prev;
        return [...prev, newMessage];
      });
    }
  };

  socket.on("new_message", handleNewMessage);

  return () => {
    socket.off("new_message", handleNewMessage);
  };
}, [teacher?._id]);
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