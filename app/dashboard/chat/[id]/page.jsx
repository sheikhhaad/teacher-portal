"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Send,
  Paperclip,
  ChevronLeft,
  Calendar,
  FileText,
  User,
  GraduationCap,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  UserCircle,
  Reply,
  MoreVertical,
  BookOpen,
} from "lucide-react";
import axios from "axios";
import { useQueries } from "@/app/context/QueryContext";
import { useTeacher } from "@/app/context/AuthContext";

const TeacherQueryDetail = () => {
  const { id } = useParams();
  const router = useRouter();
  const { queries, loading, updateQueryStatus } = useQueries();
  const { teacher } = useTeacher();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [fetchingMessages, setFetchingMessages] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showStudentInfo, setShowStudentInfo] = useState(false);

  const messagesEndRef = useRef(null);
  const statusDropdownRef = useRef(null);

  // Find query from context
  const query = queries?.find((q) => q._id === id);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close status dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target)
      ) {
        setShowStatusDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch messages for this query
  const fetchMessages = async () => {
    if (!query?._id) return;

    setFetchingMessages(true);
    try {
      const res = await axios.get(
        `https://stu-portal-backend.vercel.app/api/messages/${query._id}`,
        { withCredentials: true },
      );

      if (res.data && res.data.length > 0) {
        // Transform messages to match your format
        const formattedMessages = res.data.map((msg) => ({
          id: msg._id,
          sender:
            msg.sender_role === "teacher"
              ? teacher?.name || "You"
              : msg.studentName || "Student",
          senderRole: msg.sender_role,
          content: msg.message,
          timestamp: new Date(msg.createdAt).toLocaleString(),
          avatar:
            msg.sender_role === "teacher"
              ? teacher?.name?.[0]?.toUpperCase() || "T"
              : msg.studentName?.[0]?.toUpperCase() || "S",
          studentName: msg.studentName,
          studentId: msg.studentId,
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

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim() || !teacher?._id || !id) return;

    setSending(true);
    try {
      const res = await axios.post(`http://localhost:3000/api/messages/send`, {
        query_id: id,
        sender_id: teacher._id,
        sender_role: "teacher",
        message: message.trim(),
      });

      // Add the new message to the list
      const newMessage = {
        id: res.data._id || Date.now().toString(),
        sender: teacher?.name || "You",
        senderRole: "teacher",
        content: message.trim(),
        timestamp: new Date().toLocaleString(),
        avatar: teacher?.name ? teacher.name.charAt(0).toUpperCase() : "T",
      };

      setMessages((prev) => [...prev, newMessage]);
      setMessage("");

      // If query was pending, automatically update to in progress
      if (query?.status === "pending") {
        await handleStatusChange("in progress");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!query?._id || updatingStatus) return;

    setUpdatingStatus(true);
    try {
      await updateQueryStatus(query._id, newStatus);
      setShowStatusDropdown(false);
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdatingStatus(false);
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

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      case "in progress":
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return {
          bg: "bg-yellow-50",
          text: "text-yellow-700",
          border: "border-yellow-200",
          icon: "text-yellow-500",
          light: "bg-yellow-50/50",
        };
      case "in progress":
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-200",
          icon: "text-blue-500",
          light: "bg-blue-50/50",
        };
      case "resolved":
        return {
          bg: "bg-green-50",
          text: "text-green-700",
          border: "border-green-200",
          icon: "text-green-500",
          light: "bg-green-50/50",
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-700",
          border: "border-gray-200",
          icon: "text-gray-500",
          light: "bg-gray-50/50",
        };
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  if (loading && queries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-100 border-t-indigo-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-indigo-600 animate-pulse" />
          </div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">
          Loading query details...
        </p>
      </div>
    );
  }

  if (!query) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-10 w-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Query Not Found
          </h2>
          <p className="text-gray-500 mb-6">
            The query you are looking for does not exist or has been removed.
          </p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Back to All Queries
          </button>
        </div>
      </div>
    );
  }

  const statusColors = getStatusColor(query.status);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Back Navigation */}
      <button
        onClick={() => router.back()}
        className="group inline-flex items-center text-gray-600 hover:text-indigo-600 mb-6 transition-all"
      >
        <div className="p-1 rounded-lg group-hover:bg-indigo-50 transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </div>
        <span className="font-medium">Back to Queries</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Chat */}
        <div className="lg:col-span-2">
          {/* Query Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <BookOpen className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {query.course}
                    </h2>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <FileText className="h-4 w-4 mr-1" />
                      ID: {query._id.slice(-8)}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(query.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Status Badge with Dropdown */}
                <div className="relative" ref={statusDropdownRef}>
                  <button
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    disabled={updatingStatus}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${statusColors.bg} ${statusColors.border} ${statusColors.text} hover:shadow-md`}
                  >
                    {getStatusIcon(query.status)}
                    <span className="font-medium capitalize">
                      {query.status}
                    </span>
                    {updatingStatus ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                    ) : (
                      <MoreVertical className="h-4 w-4" />
                    )}
                  </button>

                  {/* Status Dropdown */}
                  {showStatusDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-10 animate-fade-in">
                      {["pending", "in progress", "resolved"].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(status)}
                          className={`w-full text-left px-4 py-2.5 flex items-center gap-2 hover:bg-gray-50 transition-colors ${
                            query.status === status
                              ? getStatusColor(status).text
                              : "text-gray-700"
                          }`}
                        >
                          {getStatusIcon(status)}
                          <span className="capitalize">{status}</span>
                          {query.status === status && (
                            <CheckCircle className="h-4 w-4 ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Query Content */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {typeof query.query === "string"
                    ? query.query
                    : "No query text"}
                </p>
              </div>
            </div>
          </div>

          {/* Chat Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Discussion
                </h3>
                <span className="text-sm text-gray-500">
                  {messages.length} message{messages.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Messages Container */}
            <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto bg-gray-50/50">
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
                          {showAvatar ? (
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
                          ) : (
                            <div
                              className={`flex-shrink-0 ${isTeacher ? "ml-3" : "mr-3"} w-10`}
                            />
                          )}

                          {/* Message Content */}
                          <div>
                            {showAvatar && (
                              <div
                                className={`text-xs font-medium mb-1.5 ${isTeacher ? "text-right" : "text-left"}`}
                              >
                                <span
                                  className={
                                    isTeacher
                                      ? "text-indigo-600"
                                      : "text-gray-700"
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
                    Start the conversation with the student
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
                      placeholder="Type your response..."
                      rows="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none pr-12 transition-all"
                      style={{ minHeight: "52px", maxHeight: "120px" }}
                    />
                    <button
                      type="button"
                      className="absolute right-3 bottom-3 text-gray-400 hover:text-indigo-600 transition-colors"
                      title="Attach file"
                    >
                      <Paperclip className="h-5 w-5" />
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!message.trim() || sending}
                    className={`p-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-md ${
                      !message.trim() || sending
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:shadow-lg transform hover:-translate-y-0.5"
                    }`}
                    title="Send message"
                  >
                    {sending ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-3 text-center">
                  Press Enter to send • Shift + Enter for new line
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherQueryDetail;
