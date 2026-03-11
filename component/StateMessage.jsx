import React from "react";
import { AlertCircle } from "lucide-react";
import Button from "./Button";

export default function StateMessage({
  icon: Icon = AlertCircle,
  title,
  description,
  actionLabel,
  onAction,
  variant = "empty", // "empty" | "error"
  className = "",
}) {
  const isError = variant === "error";

  return (
    <div className={`text-center py-16 px-4 ${className}`}>
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
          isError ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-400"
        }`}
      >
        <Icon size={32} />
      </div>
      <h3
        className={`text-lg font-bold mb-1 ${
          isError ? "text-red-600" : "text-gray-900"
        }`}
      >
        {title}
      </h3>
      {description && (
        <p className="text-gray-500 max-w-md mx-auto mb-6">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          variant={isError ? "danger" : "primary"}
          className="mx-auto"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
