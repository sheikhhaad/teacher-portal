import React from "react";
import { Loader2 } from "lucide-react";

export default function Loading({ message = "Loading...", className = "" }) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 space-y-4 ${className}`}
    >
      <div className="relative">
        <div className="w-12 h-12 border-4 border-indigo-100 rounded-full"></div>
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
      {message && <p className="text-gray-500 font-medium">{message}</p>}
    </div>
  );
}
