import {
  Video,
  Calendar,
  Clock,
  User,
  ExternalLink,
  CheckCircle,
  Zap,
} from "lucide-react";

const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatTime = (d) =>
  new Date(d).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

const statusMeta = {
  pending: {
    label: "Pending",
    dot: "#f59e0b",
    pill: "bg-amber-50 text-amber-600 ring-amber-200",
  },
  accepted: {
    label: "Accepted",
    dot: "#6366f1",
    pill: "bg-indigo-50 text-indigo-600 ring-indigo-200",
  },
  completed: {
    label: "Completed",
    dot: "#10b981",
    pill: "bg-emerald-50 text-emerald-600 ring-emerald-200",
  },
  expired: {
    label: "Expired",
    dot: "#ef4444",
    pill: "bg-red-50 text-red-600 ring-red-200",
  },
};

export default function MeetingCard({ meeting, onAccept }) {
  const now = Date.now();

  const start = new Date(meeting.session_start);
  const end = new Date(meeting.session_end);

  let status = meeting.status || "pending";

  if (now > end.getTime() && status !== "completed") {
    status = "expired";
  }

  const meta = statusMeta[status] ?? statusMeta.pending;

  return (
    <div className="group relative bg-white rounded-[1.75rem] overflow-hidden transition-all duration-300 hover:-translate-y-1 premium-panel hover:shadow-xl">
      
      {/* top strip */}
      <div
        className="h-1 w-full"
        style={{
          background: `linear-gradient(90deg, ${meta.dot}88, ${meta.dot})`,
        }}
      />

      <div className="p-6 flex flex-col lg:flex-row lg:items-center gap-6">

        {/* date block */}
        <div
          className="hidden sm:flex flex-col items-center justify-center w-20 h-20 rounded-2xl shrink-0 select-none"
          style={{ background: "#f5f5ff", border: "1.5px solid #e0e0f5" }}
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
            {MONTHS[start.getMonth()]}
          </span>

          <span className="text-3xl font-black text-indigo-700 leading-none">
            {start.getDate()}
          </span>

          <span className="text-[10px] font-medium text-indigo-300">
            {start.getFullYear()}
          </span>
        </div>

        {/* info */}
        <div className="flex-1 space-y-3 min-w-0">

          <div className="flex flex-wrap items-center gap-2">

            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ${meta.pill}`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: meta.dot }}
              />
              {meta.label}
            </span>

            <span className="text-xs text-gray-400 flex items-center gap-1 font-semibold">
              <Clock size={12} className="text-gray-300" />
              {meeting.duration} min session
            </span>

          </div>

          <h3 className="text-lg font-black text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
            Session with Student
          </h3>

          <div className="flex flex-wrap gap-x-5 gap-y-1.5">

            <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <User size={13} className="text-gray-300 shrink-0" />
              Student ···{meeting.student_id?.slice(-6)}
            </span>

            <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <Zap size={13} className="text-gray-300 shrink-0" />
              Meeting {meeting.meeting_id}
            </span>

            <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <Calendar size={13} className="text-gray-300 shrink-0" />
              {formatDate(meeting.session_start)}
            </span>

            <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <Clock size={13} className="text-gray-300 shrink-0" />
              {formatTime(meeting.session_start)} – {formatTime(meeting.session_end)}
            </span>

          </div>
        </div>

        {/* actions */}
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">

          {meeting.meeting_link && status !== "expired" && (
            <a
              href={meeting.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className="premium-gradient inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Video size={16} />
              Join
              <ExternalLink size={12} className="opacity-60" />
            </a>
          )}

          {status === "pending" && (
            <button
              onClick={() => onAccept(meeting._id)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 active:translate-y-0"
              style={{
                background: "#f0fdf4",
                color: "#059669",
                border: "1.5px solid #a7f3d0",
                boxShadow: "0 2px 8px rgba(16,185,129,.08)",
              }}
            >
              <CheckCircle size={16} />
              Accept
            </button>
          )}

        </div>
      </div>
    </div>
  );
}