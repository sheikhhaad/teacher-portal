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

      // ✅ Set active chat before fetching so socket handler knows
      // which chat is open
      activeChatIdRef.current = `${studentId}_${teacher._id}`;

      try {
        setLoading(true);
        const res = await api.get(`/api/messages/${studentId}/${teacher._id}`);
        // ✅ Removed redundant client-side filter — backend already
        // returns only messages for this chat_id
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
    setMessages([]);
    activeChatIdRef.current = null; // ✅ clear active chat on unmount
  };

  // ✅ Socket listener — uses ref to check active chat, not stale state
  useEffect(() => {
    const handleReceiveMessage = (newMessage) => {
      // Ignore messages not belonging to the currently open chat
      if (
        activeChatIdRef.current &&
        newMessage.chat_id !== activeChatIdRef.current
      ) {
        return;
      }

      setMessages((prev) => {
        // Deduplicate — ignore if already in list (could be our own
        // optimistic message that was already replaced)
        if (prev.find((m) => m._id === newMessage._id)) return prev;
        return [...prev, newMessage];
      });
    };

    // ✅ Fixed event name: backend emits "receive_message",
    // was previously "new_message" — mismatch caused zero real-time delivery
    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, []); // ✅ empty deps — ref keeps this handler current without re-registering

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
