// app/teacher/chat/[id]/page.jsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Send, ChevronLeft, MessageSquare, Loader2 } from "lucide-react";
import { useChat } from "@/app/context/ChatContext";
import { useEnrollMent } from "@/app/context/EnrollStuContext";

const TeacherChatPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const studentId = id;
  const [message, setMessage] = useState("");
  const [localSending, setLocalSending] = useState(false); // Add local sending state
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const {
    messages,
    loading,
    sending,
    fetchMessages,
    sendMessage,
    clearMessages,
  } = useChat();

  const { enrollMent } = useEnrollMent();

  const student = enrollMent?.students?.find((s) => s._id === studentId);

  // ✅ Removed fetchMessages from dep array — it's a useCallback that
  // only changes when teacher._id changes, not on every render.
  // Including it caused double-fetches when the context re-rendered.
  useEffect(() => {
    if (studentId) {
      fetchMessages(studentId);
    }
    return () => {
      clearMessages();
    };
  }, [studentId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Auto-grow textarea as user types
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 150)}px`;
  }, [message]);

  // ✅ Filter out duplicate messages (optimistic + real)
  const getUniqueMessages = useCallback((messagesList) => {
    const uniqueMap = new Map();

    messagesList.forEach((msg) => {
      // Create a unique key using message content, timestamp, and sender
      const key = `${msg.message}_${msg.createdAt}_${msg.sender_role}`;

      // If this is an optimistic message and we have a real one with same content, skip the optimistic
      if (msg._isOptimistic && uniqueMap.has(key)) {
        const existing = uniqueMap.get(key);
        if (!existing._isOptimistic) {
          return; // Skip optimistic if real message exists
        }
      }

      // Keep the real message over optimistic
      if (
        !uniqueMap.has(key) ||
        (!msg._isOptimistic && uniqueMap.get(key)._isOptimistic)
      ) {
        uniqueMap.set(key, msg);
      }
    });

    return Array.from(uniqueMap.values());
  }, []);

  const uniqueMessages = getUniqueMessages(messages);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || localSending || sending) return;

    const text = message;
    setLocalSending(true);
    setMessage(""); // ✅ Clear immediately for snappy UX

    try {
      const success = await sendMessage(studentId, text);
      if (!success) {
        // Restore message text if send failed
        setMessage(text);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessage(text);
    } finally {
      setLocalSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 h-[calc(100vh-80px)] xl:h-auto flex flex-col animate-fade-in">
      {/* Back Button */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-200 text-gray-700 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-md transition-all flex items-center gap-2 font-medium"
        >
          <ChevronLeft className="h-5 w-5" />
          Back to Students
        </button>
      </div>

      {/* Chat Section */}
      <div className="flex-1 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col min-h-[600px] xl:min-h-0">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50 via-white to-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md border-2 border-white">
                {student?.name ? student.name.charAt(0).toUpperCase() : "S"}
              </div>
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                {student?.name || "Student"}
              </h3>
              <p className="text-sm text-gray-500">
                {student?.rollNumber && (
                  <span>Roll No: {student.rollNumber}</span>
                )}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full shadow-sm">
              {uniqueMessages.length} Message
              {uniqueMessages.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50">
          {loading && uniqueMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-indigo-500">
              <Loader2 className="h-10 w-10 animate-spin mb-4" />
              <p className="text-gray-500 font-medium">
                Loading conversation...
              </p>
            </div>
          ) : uniqueMessages.length > 0 ? (
            <div className="space-y-6">
              {uniqueMessages.map((msg, index) => {
                const isTeacher = msg.sender_role === "teacher";
                const showAvatar =
                  index === 0 ||
                  uniqueMessages[index - 1]?.sender_role !== msg.sender_role;

                // ✅ Optimistic messages show with slight opacity so the
                // user knows they're in-flight
                const isOptimistic = msg._isOptimistic === true;

                return (
                  <div
                    key={msg._id || `optimistic_${msg.createdAt}_${index}`}
                    className={`flex ${isTeacher ? "justify-end" : "justify-start"} animate-slide-up`}
                  >
                    <div
                      className={`flex max-w-[85%] md:max-w-[75%] ${isTeacher ? "flex-row-reverse" : "flex-row"} ${isOptimistic ? "opacity-70" : "opacity-100"} transition-opacity duration-200`}
                    >
                      {/* Avatar */}
                      {showAvatar && (
                        <div
                          className={`flex-shrink-0 ${isTeacher ? "ml-3" : "mr-3"}`}
                        >
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold shadow-sm border border-white ${
                              isTeacher
                                ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white"
                                : "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700"
                            }`}
                          >
                            {isTeacher
                              ? "T"
                              : student?.name?.charAt(0).toUpperCase() || "S"}
                          </div>
                        </div>
                      )}

                      {!showAvatar && (
                        <div
                          className={`flex-shrink-0 w-10 ${isTeacher ? "ml-3" : "mr-3"}`}
                        />
                      )}

                      {/* Bubble */}
                      <div>
                        {showAvatar && (
                          <div
                            className={`text-[11px] font-semibold mb-1.5 tracking-wide ${isTeacher ? "text-right" : "text-left"}`}
                          >
                            <span
                              className={
                                isTeacher ? "text-indigo-600" : "text-gray-600"
                              }
                            >
                              {isTeacher
                                ? "You (Instructor)"
                                : student?.name || "Student"}
                            </span>
                          </div>
                        )}

                        <div
                          className={`rounded-2xl px-5 py-3 shadow-sm relative ${
                            isTeacher
                              ? "bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-tr-none"
                              : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                          }`}
                        >
                          <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                            {msg.message}
                          </p>
                          <div
                            className={`text-[10px] mt-2 text-right flex items-center justify-end gap-1 ${
                              isTeacher ? "text-indigo-200" : "text-gray-400"
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {/* ✅ Sending indicator for optimistic messages */}
                            {isOptimistic && (
                              <Loader2 className="h-2.5 w-2.5 animate-spin" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md border border-indigo-100 hover:scale-105 transition-transform duration-300">
                <MessageSquare className="h-10 w-10 text-indigo-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No messages yet
              </h3>
              <p className="text-gray-500 max-w-sm">
                Start the conversation with {student?.name || "this student"}.
                Your messages will appear here.
              </p>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 sm:p-6 border-t border-gray-100 bg-white">
          <form onSubmit={handleSendMessage}>
            <div className="flex items-end gap-3 bg-gray-50 p-2 rounded-3xl border border-gray-100 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all shadow-inner">
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  rows="1"
                  disabled={localSending || sending}
                  className="w-full px-4 py-3 bg-transparent border-none focus:ring-0 resize-none outline-none custom-scrollbar text-gray-700 placeholder-gray-400 disabled:opacity-50"
                  style={{ minHeight: "24px", maxHeight: "150px" }}
                />
              </div>
              <button
                type="submit"
                disabled={!message.trim() || localSending || sending}
                className={`p-3.5 rounded-full flex items-center justify-center transition-all ${
                  !message.trim() || localSending || sending
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg shadow-md transform hover:-translate-y-0.5"
                }`}
              >
                {localSending || sending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5 ml-1" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center hidden sm:block font-medium">
              Press{" "}
              <span className="text-gray-500 bg-gray-100 px-1 py-0.5 rounded">
                Enter
              </span>{" "}
              to send •{" "}
              <span className="text-gray-500 bg-gray-100 px-1 py-0.5 rounded ml-1">
                Shift + Enter
              </span>{" "}
              for new line
            </p>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
};

export default TeacherChatPage;
