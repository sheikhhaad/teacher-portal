"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Send, ChevronLeft, MessageSquare, BookOpen } from "lucide-react";
import api from "@/utils/api";
import { useQueries } from "@/app/context/QueryContext";
import { useTeacher } from "@/app/context/AuthContext";
import Button from "@/component/Button";

const TeacherQueryDetail = () => {
  const { id } = useParams();
  const router = useRouter();
  const { queries, loading } = useQueries();
  const { teacher, loading: authLoading } = useTeacher();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [fetchingMessages, setFetchingMessages] = useState(false);

  const messagesEndRef = useRef(null);

  // Find query from context
  const query = queries?.find((q) => q._id === id);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages for this query
  const fetchMessages = async () => {
    if (!query?._id) return;

    setFetchingMessages(true);
    try {
      const res = await api.get(`/api/messages/${query._id}`);

      if (res.data && res.data.length > 0) {
        const formattedMessages = res.data.map((msg) => ({
          id: msg._id,
          sender:
            msg.sender_role === "teacher"
              ? teacher?.name || "You"
              : msg.studentName || "Student",
          senderRole: msg.sender_role,
          content: msg.message,
          timestamp: new Date(msg.createdAt).toLocaleString(),
        }));

        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setFetchingMessages(false);
    }
  };

  // Fetch messages when component mounts
  useEffect(() => {
    if (query?._id) {
      fetchMessages();
    }
  }, [query?._id]);

  useEffect(() => {
    if (!query?._id) return;

    const handleReceiveMessage = (msg) => {
      if (msg.query_id === query._id) {
        setMessages((prev) => {
          if (prev.find((m) => m.id === msg._id)) return prev;
          
          const formattedMessage = {
            id: msg._id,
            sender: msg.sender_role === "teacher"
                ? teacher?.name || "You"
                : msg.studentName || "Student",
            senderRole: msg.sender_role,
            content: msg.message,
            timestamp: new Date(msg.createdAt).toLocaleString(),
          };
          return [...prev, formattedMessage];
        });
      }
    };

   

    return () => {
      
    };
  }, [query?._id, teacher]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim() || !teacher?._id || !id) return;

    setSending(true);
    try {
      const res = await api.post(`/api/messages/send`, {
        query_id: id,
        sender_id: teacher._id,
        sender_role: "teacher",
        message: message.trim(),
      });

      const newMessage = {
        id: res.data._id || Date.now().toString(),
        sender: teacher?.name || "You",
        senderRole: "teacher",
        content: message.trim(),
        timestamp: new Date().toLocaleString(),
      };

      setMessages((prev) => [...prev, newMessage]);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() && !sending) {
        handleSendMessage(e);
      }
    }
  };

  if ((authLoading || loading) && queries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-100 border-t-indigo-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-indigo-600 animate-pulse" />
          </div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Loading chat...</p>
      </div>
    );
  }

  if (!query && !authLoading && !loading) {
    return (
      <div className="max-w-8xl mx-auto py-12 px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-10 w-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Chat Not Found
          </h2>
          <p className="text-gray-500 mb-6">
            The conversation you are looking for does not exist.
          </p>
          <Button
            variant="primary"
            onClick={() => router.back()}
            icon={ChevronLeft}
          >
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Button
        variant="secondary"
        onClick={() => router.back()}
        icon={ChevronLeft}
        className="mb-6"
      >
        Back
      </Button>

      {/* Chat Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Chat Discussion
            </h3>
            <span className="text-sm text-gray-500">
              {messages.length} message{messages.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Messages Container */}
        <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto bg-gray-50/50">
          {fetchingMessages ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-indigo-200 border-t-indigo-600"></div>
            </div>
          ) : messages.length > 0 ? (
            <>
              {messages.map((msg, index) => {
                const isTeacher = msg.senderRole === "teacher";
                const showAvatar =
                  index === 0 ||
                  messages[index - 1]?.senderRole !== msg.senderRole;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isTeacher ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex max-w-[85%] md:max-w-[75%] ${isTeacher ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {/* Avatar */}
                      {showAvatar && (
                        <div
                          className={`flex-shrink-0 ${isTeacher ? "ml-3" : "mr-3"}`}
                        >
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold shadow-md ${
                              isTeacher
                                ? "bg-indigo-600 text-white"
                                : "bg-gray-700 text-white"
                            }`}
                          >
                            {isTeacher ? "T" : "S"}
                          </div>
                        </div>
                      )}

                      {/* Message Content */}
                      <div>
                        {showAvatar && (
                          <div
                            className={`text-xs font-medium mb-1.5 ${isTeacher ? "text-right" : "text-left"}`}
                          >
                            <span
                              className={
                                isTeacher ? "text-indigo-600" : "text-gray-700"
                              }
                            >
                              {isTeacher ? "You (Instructor)" : msg.sender}
                            </span>
                            <span className="text-gray-400 mx-2">•</span>
                            <span className="text-gray-400 text-xs">
                              {msg.timestamp}
                            </span>
                          </div>
                        )}

                        <div
                          className={`rounded-2xl p-4 shadow-sm ${
                            isTeacher
                              ? "bg-indigo-600 text-white rounded-tr-none"
                              : "bg-white text-gray-800 rounded-tl-none border border-gray-200"
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-10 w-10 text-indigo-400" />
              </div>
              <p className="text-gray-600 font-medium">No messages yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Start the conversation
              </p>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="p-6 border-t border-gray-100 bg-white">
          <form onSubmit={handleSendMessage}>
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  rows="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none pr-12 transition-all"
                  style={{ minHeight: "52px", maxHeight: "120px" }}
                />
              </div>
              <Button
                type="submit"
                disabled={!message.trim()}
                isLoading={sending}
                variant="primary"
                size="icon"
                icon={Send}
              />
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              Press Enter to send • Shift + Enter for new line
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeacherQueryDetail;
