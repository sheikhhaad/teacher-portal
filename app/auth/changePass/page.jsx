// app/reset-password/page.js
"use client";
export const dynamic = "force-dynamic";
import api from "@/utils/api";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

const ResetPasswordPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Redirect if no email is provided
  useEffect(() => {
    if (!email) {
      setMessage({
        type: "error",
        text: "Invalid request. Please go through forgot password process again.",
      });
      setTimeout(() => {
        router.push("/forgot-password");
      }, 2000);
    }
  }, [email, router]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear message when user starts typing
    if (message.text) setMessage({ type: "", text: "" });
  };

  const validatePassword = (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*]/.test(password),
    };
    return checks;
  };

  const passwordChecks = validatePassword(formData.newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    const { newPassword, confirmPassword } = formData;

    // Validation
    if (!newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "Please fill in all fields." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    // Check all password requirements
    const allChecksPassed = Object.values(passwordChecks).every(check => check === true);
    if (!allChecksPassed) {
      setMessage({
        type: "error",
        text: "Please meet all password requirements before proceeding.",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/api/auth/teacher/resetPassword", {
        email: email,
        password: newPassword,
      });

      console.log("Password reset success:", response);
      setMessage({
        type: "success",
        text: "Password changed successfully! Redirecting to login...",
      });

      // Clear form
      setFormData({ newPassword: "", confirmPassword: "" });

      // Redirect to login page after 2 seconds
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-xl shadow-lg p-8">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Create New Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {email ? `Reset password for ${email}` : "Please enter your new password"}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* New Password Field */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                name="newPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={formData.newPassword}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Password Requirements with Live Validation */}
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

          {/* Password Match Indicator */}
          {formData.confirmPassword && (
            <div className="flex items-center text-xs">
              {formData.newPassword === formData.confirmPassword ? (
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

          {/* Message Display */}
          {message.text && (
            <div
              className={`rounded-md p-4 text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Changing Password..." : "Change Password"}
            </button>
          </div>

          {/* Back to Login Link */}
          <div className="text-sm text-center">
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              ← Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;