// app/auth/changePass/page.js
"use client";

import api from "@/utils/api";
import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

function ChangePasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-red-600 mb-4">Invalid request. Email is required.</p>
          <p className="text-xs text-gray-400 mb-4">Debug: No email found in URL</p>
          <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
            Go back to forgot password
          </Link>
        </div>
      </div>
    );
  }

  const validatePassword = (password) => {
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number";
    if (!/[!@#$%^&*]/.test(password)) return "Password must contain at least one special character (!@#$%^&*)";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "Please fill in all fields" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setMessage({ type: "error", text: passwordError });
      return;
    }

    setLoading(true);

    try {
      await api.post("/api/auth/teacher/resetPassword", {
        email,
        password: newPassword,
      });

      setMessage({ type: "success", text: "Password changed successfully! Redirecting to login..." });

      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to reset password. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const passwordChecks = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[!@#$%^&*]/.test(newPassword),
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Create New Password</h2>
          <p className="text-sm text-gray-600 mt-2">
            Reset password for <span className="font-medium">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-md p-3 space-y-2">
            <p className="text-xs font-medium text-gray-700">Password requirements:</p>
            <ul className="space-y-1.5">
              <li className="flex items-center text-xs">
                {passwordChecks.length ? (
                  <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-gray-400 mr-2" />
                )}
                <span className={passwordChecks.length ? "text-green-700" : "text-gray-600"}>
                  At least 8 characters
                </span>
              </li>
              <li className="flex items-center text-xs">
                {passwordChecks.uppercase ? (
                  <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-gray-400 mr-2" />
                )}
                <span className={passwordChecks.uppercase ? "text-green-700" : "text-gray-600"}>
                  One uppercase letter (A-Z)
                </span>
              </li>
              <li className="flex items-center text-xs">
                {passwordChecks.lowercase ? (
                  <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-gray-400 mr-2" />
                )}
                <span className={passwordChecks.lowercase ? "text-green-700" : "text-gray-600"}>
                  One lowercase letter (a-z)
                </span>
              </li>
              <li className="flex items-center text-xs">
                {passwordChecks.number ? (
                  <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-gray-400 mr-2" />
                )}
                <span className={passwordChecks.number ? "text-green-700" : "text-gray-600"}>
                  One number (0-9)
                </span>
              </li>
              <li className="flex items-center text-xs">
                {passwordChecks.special ? (
                  <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-gray-400 mr-2" />
                )}
                <span className={passwordChecks.special ? "text-green-700" : "text-gray-600"}>
                  One special character (!@#$%^&*)
                </span>
              </li>
            </ul>
          </div>

          {confirmPassword && (
            <div className="flex items-center text-xs">
              {newPassword === confirmPassword ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-700">Passwords match</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-red-700">Passwords do not match</span>
                </>
              )}
            </div>
          )}

          {message.text && (
            <div
              className={`rounded-md p-3 text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Changing Password..." : "Change Password"}
          </button>

          <div className="text-center">
            <Link
              href="/auth/login"
              className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center"
            >
              <ArrowLeft className="h-3 w-3 mr-1" />
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ChangePasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ChangePasswordForm />
    </Suspense>
  );
}