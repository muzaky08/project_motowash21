import { io, Socket } from "socket.io-client";
import { API_ORIGIN } from "./api";

let socket: Socket | null = null;

export function getSocket(token: string) {
  // If socket exists and has the same token, don't recreate it
  if (socket) {
    const currentAuth = socket.auth as { token?: string };
    if (currentAuth?.token === token) {
      if (!socket.connected && !socket.active) {
        socket.connect();
      }
      return socket;
    }
    // Only disconnect if token is actually different
    socket.disconnect();
  }

  const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5005';
  
  socket = io(socketUrl, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
