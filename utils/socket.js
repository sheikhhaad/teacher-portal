import { io } from "socket.io-client";

const socket = io("http://localhost:8000");

socket.on("connect", () => console.log("Socket connected:", socket.id));
socket.on("connect_error", (err) => console.log("Socket error:", err));

export default socket;
