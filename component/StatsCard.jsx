export default function StatsCard({
  icon: Icon,
  label,
  title,
  value,
  accent,
  color,
}) {
  // Support both new (label, accent) and legacy (title, color) props
  const displayLabel = label || title;
  const displayAccent =
    accent ||
    (color?.startsWith("bg-") ? color.replace("bg-", "") : color) ||
    "#6366f1";

  // Map Tailwind color names to hex if possible, or just use as is for CSS variables/colors
  const finalAccent = displayAccent.startsWith("#")
    ? displayAccent
    : displayAccent === "indigo-600"
      ? "#4f46e5"
      : displayAccent === "emerald-600"
        ? "#059669"
        : displayAccent === "amber-500"
          ? "#f59e0b"
          : displayAccent === "rose-600"
            ? "#e11d48"
            : displayAccent;

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 flex items-center gap-5 bg-white premium-panel">
      {/* coloured left bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-3xl"
        style={{ background: finalAccent }}
      />
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: `${finalAccent}18` }}
      >
        <Icon size={24} style={{ color: finalAccent }} />
      </div>
      <div>
        <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-0.5">
          {displayLabel}
        </p>
        <p className="text-4xl font-black text-gray-900 leading-none">
          {value}
        </p>
      </div>
    </div>
  );
}
