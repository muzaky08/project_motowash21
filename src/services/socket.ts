import { io, Socket } from "socket.io-client";
import { API_ORIGIN } from "./api";

let socket: Socket | null = null;

export function getSocket(token: string) {
  if (socket?.connected && socket.auth?.token === token) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
  }

  socket = io(API_ORIGIN, {
    auth: { token },
    transports: ["websocket", "polling"],
  });

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
