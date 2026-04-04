import axios from "axios";

const api = axios.create({
  baseURL: "https://stu-portal-backend.vercel.app",
  // baseURL: "http://localhost:8000",
  withCredentials: true,
});

export default api;
