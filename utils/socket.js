import { io } from "socket.io-client";

const socket = io("https://stu-portal-backend.vercel.app", {
  transports: ["websocket", "polling"],
});

socket.on("connect", () => console.log("Socket connected:", socket.id));
socket.on("connect_error", (err) => console.log("Socket error:", err));

export default socket;