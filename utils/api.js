import axios from "axios";

// const API_URL = "https://stu-portal-backend.vercel.app";
const API_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export default api;
