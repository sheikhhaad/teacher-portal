"use client";

import { createContext, useContext, useState, useCallback } from "react";
import api from "@/utils/api";
import { useTeacher } from "./AuthContext";

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { teacher } = useTeacher();

  const fetchMessages = useCallback(
    async (studentId) => {
      if (!studentId || !teacher?._id) return;

      try {
        setLoading(true);
        const res = await api.get(`/api/messages/${studentId}/${teacher._id}`);
        const filteredMessages = res.data.filter(
          (msg) => msg.chat_id === `${studentId}_${teacher._id}`,
        );
        setMessages(filteredMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    },
    [teacher?._id],
  );

  const sendMessage = async (studentId, messageText) => {
    if (!messageText.trim() || !studentId || !teacher?._id) return false;

    try {
      setSending(true);
      await api.post("/api/messages/send", {
        sender_id: teacher._id,
        sender_role: "teacher",
        student_id: studentId,
        teacher_id: teacher._id,
        message: messageText,
      });
      await fetchMessages(studentId); // Refresh messages after sending
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    } finally {
      setSending(false);
    }
  };

  const clearMessages = () => setMessages([]);

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
