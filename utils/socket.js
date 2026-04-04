import { io } from "socket.io-client";

const SOCKET_URL = "https://stu-portal-backend.vercel.app";
// const SOCKET_URL = "http://localhost:8000";
const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});
socket.on("connect", () => console.log("Socket connected:", socket.id));
socket.on("connect_error", (err) => console.log("Socket error:", err));

export default socket;
