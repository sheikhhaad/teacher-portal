import axios from "axios";

const api = axios.create({
   baseURL: "http://localhost:8000",
  // baseURL: "https://stu-portal-backend.vercel.app",
  withCredentials: true,
});

export default api;
