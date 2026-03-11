import React from "react";
import { Loader2 } from "lucide-react";

export default function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  isLoading = false,
  disabled = false,
  className = "",
  type = "button",
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-95";

  const variants = {
    primary:
      "text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-[0_4px_14px_0_rgba(99,102,241,0.35)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)]",
    secondary:
      "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm",
    outline:
      "bg-transparent text-indigo-600 border-2 border-indigo-100 hover:border-indigo-600 hover:bg-indigo-50",
    danger:
      "text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-[0_4px_14px_0_rgba(239,68,68,0.35)]",
    success:
      "text-emerald-600 bg-emerald-50 border-1.5 border-emerald-200 hover:bg-emerald-100 shadow-[0_2px_8px_0_rgba(16,185,129,0.08)]",
    ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5 rounded-lg",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5",
    icon: "p-2",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading && (
        <Loader2
          className={`animate-spin ${
            size === "sm" ? "w-3 h-3" : size === "lg" ? "w-5 h-5" : "w-4 h-4"
          }`}
        />
      )}
      {!isLoading && Icon && iconPosition === "left" && (
        <Icon
          className={`${
            size === "sm" ? "w-3 h-3" : size === "lg" ? "w-5 h-5" : "w-4 h-4"
          }`}
        />
      )}
      {children}
      {!isLoading && Icon && iconPosition === "right" && (
        <Icon
          className={`${
            size === "sm" ? "w-3 h-3" : size === "lg" ? "w-5 h-5" : "w-4 h-4"
          }`}
        />
      )}
    </button>
  );
}
