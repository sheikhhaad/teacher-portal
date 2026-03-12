"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTeacher } from "@/app/context/AuthContext";
import api from "@/utils/api";
import Button from "@/component/Button";

const page = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setTeacher } = useTeacher();
  const router = useRouter();

  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e?.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      let res = await api.post(
        "/api/auth/teacher/login",
        {
          email,
          password,
        },
        {
          withCredentials: true,
        },
      );
      if (res.data?.teacher) {
        router.push("/dashboard");
      } else {
        setError("Invalid response from server");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center h-screen">
        <div className="rounded-xl border border-gray-200 py-8 px-6 max-w-90 w-full">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-8 w-8 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              ></path>
            </svg>
          </div>

          <h3 className="mb-6 text-center text-xl font-bold text-gray-800">
            Teacher Login
          </h3>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                required=""
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
            </div>

            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                required=""
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full mt-2"
              variant="primary"
            >
              Sign In
            </Button>

            <div className="mt-4 text-center">
              <a href="#" className="text-sm text-blue-500 hover:text-blue-600">
                Forgot Password?
              </a>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default page;
