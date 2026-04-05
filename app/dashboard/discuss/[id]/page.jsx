"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Send, ChevronLeft, MessageSquare, Loader2 } from "lucide-react";
import { useEnrollMent } from "@/app/context/EnrollStuContext";
import { useChat } from "@/app/context/ChatContext";

const TeacherChatPage = () => {
  const { id: studentId } = useParams();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const {
    messages,
    loadingMessages,
    sendingMessage,
    sendMessage,
    fetchMessages,
  } = useChat();
  const { teacherEnrollments } = useEnrollMent();

  // Find student details from enrollments
  const student = React.useMemo(() => {
    if (!teacherEnrollments || !studentId) return null;
    for (const enroll of teacherEnrollments) {
      const stu = enroll.student_id;
      if (!stu) continue;
      const stuId = typeof stu === "string" ? stu : stu._id;
      if (stuId === studentId) {
        return typeof stu === "string" ? { _id: stu, name: "Student" } : stu;
      }
    }
    return null;
  }, [teacherEnrollments, studentId]);

  // Fetch messages when studentId changes
  useEffect(() => {
    if (studentId) {
      fetchMessages(studentId);
    }
  }, [studentId, fetchMessages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || sendingMessage) return;
    const text = message;
    setMessage("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
    await sendMessage(studentId, text);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Group messages by date
  const groupedMessages = (() => {
    const groups = [];
    let lastDate = null;
    messages.forEach((msg, idx) => {
      const date = new Date(msg.createdAt).toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
      if (date !== lastDate) {
        groups.push({ type: "date", label: date, key: `date-${idx}` });
        lastDate = date;
      }
      groups.push({ type: "message", data: msg, key: msg._id || idx });
    });
    return groups;
  })();

  const initials = student?.name
    ? student.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "S";

  const isLoading = loadingMessages && messages.length === 0;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="flex flex-col h-full max-w-6xl mx-auto w-full">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex items-center gap-4 shadow-lg sticky top-0 z-10 rounded-b-2xl">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-105"
            aria-label="Go back"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center font-bold text-white shadow-md">
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-lg truncate">
              {student?.name || "Student"}
            </h2>
            {student?.rollNumber && (
              <p className="text-xs text-blue-100">
                Roll #{student.rollNumber}
              </p>
            )}
          </div>

          <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium">
            {messages.length} msg{messages.length !== 1 ? "s" : ""}
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2 scroll-smooth bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-3" />
              <p className="text-gray-500 text-sm">Loading conversation...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
                <MessageSquare size={32} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No messages yet
              </h3>
              <p className="text-gray-500 text-sm max-w-sm">
                Send a message to start your conversation with{" "}
                {student?.name || "this student"}.
              </p>
            </div>
          ) : (
            <>
              {groupedMessages.map((item) => {
                if (item.type === "date") {
                  return (
                    <div
                      className="flex items-center gap-3 my-6"
                      key={item.key}
                    >
                      <div className="flex-1 h-px bg-gray-300" />
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {item.label}
                      </span>
                      <div className="flex-1 h-px bg-gray-300" />
                    </div>
                  );
                }

                const msg = item.data;
                const isTeacher = msg.sender_role === "teacher";
                return (
                  <div
                    key={item.key}
                    className={`flex animate-slide-in ${
                      isTeacher ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] lg:max-w-[60%] px-4 py-2.5 rounded-2xl ${
                        isTeacher
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-md shadow-md"
                          : "bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-200"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {msg.message}
                      </p>
                      <p
                        className={`text-xs mt-1.5 text-right ${
                          isTeacher ? "text-blue-100" : "text-gray-400"
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4 rounded-t-2xl shadow-lg">
          <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
            <div className="flex-1 bg-gray-50 rounded-2xl border-2 border-gray-200 focus-within:border-blue-500 focus-within:shadow-md transition-all">
              <textarea
                ref={inputRef}
                className="w-full px-4 py-2.5 bg-transparent border-none outline-none resize-none text-gray-800 placeholder-gray-400 rounded-2xl"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height =
                    Math.min(e.target.scrollHeight, 120) + "px";
                }}
                onKeyDown={handleKeyDown}
                placeholder="Write a message..."
                rows={1}
                style={{ minHeight: "44px", maxHeight: "120px" }}
                disabled={sendingMessage}
              />
            </div>
            <button
              type="submit"
              disabled={!message.trim() || sendingMessage}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center hover:scale-105 hover:shadow-lg transition-all duration-200 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              {sendingMessage ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-3">
            <kbd className="px-2 py-1 bg-gray-100 rounded-md text-gray-600 text-xs font-mono">
              Enter
            </kbd>{" "}
            to send &nbsp;·&nbsp;{" "}
            <kbd className="px-2 py-1 bg-gray-100 rounded-md text-gray-600 text-xs font-mono">
              Shift + Enter
            </kbd>{" "}
            for new line
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default TeacherChatPage;
