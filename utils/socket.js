import { io } from "socket.io-client";

// const SOCKET_URL = "http://localhost:8000";
const SOCKET_URL = "https://stu-portal-backend.vercel.app";
const socket = io(SOCKET_URL, {
  autoConnect: false, // Managed by NotificationContext
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
  transports: ["websocket", "polling"],
});

socket.on("connect_error", (err) => {
  console.log(`Socket connection error: ${err.message}`);
});

export default socket;

