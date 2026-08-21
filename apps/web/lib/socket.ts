"use client";

import { io, Socket } from "socket.io-client";
import { IS_MOCK } from "@/lib/api";

/**
 * Socket.io client singleton.
 * Returns null in mock mode (no real server to connect to).
 * In live mode, lazily creates and returns a single Socket connection.
 */

let _socket: Socket | null = null;

export function getSocket(): Socket | null {
  if (IS_MOCK) return null;

  if (!_socket) {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (!url) return null;

    _socket = io(url, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    _socket.on("connect", () => {
      console.log("[socket] Connected:", _socket?.id);
    });

    _socket.on("disconnect", (reason) => {
      console.log("[socket] Disconnected:", reason);
    });

    _socket.on("connect_error", (err) => {
      console.warn("[socket] Connection error:", err.message);
    });
  }

  return _socket;
}

/** Disconnect and clear the socket singleton. */
export function disconnectSocket(): void {
  if (_socket) {
    _socket.disconnect();
    _socket = null;
  }
}
