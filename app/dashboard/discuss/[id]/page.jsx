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
    if (studentId) fetchMessages(studentId);
  }, [studentId, fetchMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || sendingMessage) return;
    const text = message;
    setMessage("");
    if (inputRef.current) inputRef.current.style.height = "auto";
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
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-5 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <button
          onClick={() => router.back()}
          className="p-1.5 -ml-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-slate-600 text-sm">
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-slate-800 truncate">
            {student?.name || "Student"}
          </h2>
          {student?.rollNumber && (
            <p className="text-xs text-slate-400">Roll #{student.rollNumber}</p>
          )}
        </div>

        <div className="bg-slate-100 px-2.5 py-1 rounded-full text-xs font-medium text-slate-500">
          {messages.length} msg{messages.length !== 1 ? "s" : ""}
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-8 w-8 text-slate-400 animate-spin mb-3" />
            <p className="text-slate-500 text-sm">Loading conversation...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare size={24} className="text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-700 mb-1">
              No messages yet
            </h3>
            <p className="text-slate-400 text-sm max-w-sm">
              Send a message to start the conversation.
            </p>
          </div>
        ) : (
          <>
            {groupedMessages.map((item) => {
              if (item.type === "date") {
                return (
                  <div className="flex items-center gap-3 my-4" key={item.key}>
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      {item.label}
                    </span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>
                );
              }

              const msg = item.data;
              const isTeacher = msg.sender_role === "teacher";
              return (
                <div
                  key={item.key}
                  className={`flex ${isTeacher ? "justify-end" : "justify-start"} animate-fade-in`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                      isTeacher
                        ? "bg-slate-800  rounded-br-md"
                        : "bg-white border border-slate-100 text-slate-700 rounded-bl-md shadow-sm"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {msg.message}
                    </p>
                    <p
                      className={`text-[10px] mt-1.5 text-right ${
                        isTeacher ? "text-slate-300" : "text-slate-400"
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
      <div className="bg-white border-t border-slate-100 p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
          <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 focus-within:ring-1 focus-within:ring-slate-300 transition">
            <textarea
              ref={inputRef}
              className="w-full px-4 py-2.5 bg-transparent border-none outline-none resize-none text-slate-700 placeholder-slate-400 rounded-xl text-sm"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              style={{ minHeight: "44px", maxHeight: "120px" }}
              disabled={sendingMessage}
            />
          </div>
          <button
            type="submit"
            disabled={!message.trim() || sendingMessage}
            className="w-10 h-10 rounded-xl  hover:bg-slate-700  flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            aria-label="Send message"
          >
            {sendingMessage ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </form>
        <p className="text-center text-[10px] text-slate-400 mt-2">
          <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 text-[10px] font-mono">Enter</kbd> to send &nbsp;·&nbsp;
          <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 text-[10px] font-mono">Shift+Enter</kbd> new line
        </p>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default TeacherChatPage;