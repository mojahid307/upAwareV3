import { Server, Socket } from "socket.io";

/**
 * Socket.io event handlers.
 * Manages room subscriptions (ward rooms, city room, post rooms)
 * and provides helper functions for emitting events from route handlers.
 */

export function registerSocketHandlers(io: Server): void {
  io.on("connection", (socket: Socket) => {
    console.log(`[socket] Client connected: ${socket.id}`);

    // Auto-join the city-wide room so every client gets broadcasts.
    socket.join("city");

    // Join a specific ward room.
    socket.on("join_ward", (data: { wardId: number }) => {
      if (data.wardId >= 1 && data.wardId <= 92) {
        socket.join(`ward:${data.wardId}`);
        console.log(`[socket] ${socket.id} joined ward:${data.wardId}`);
      }
    });

    // Leave a ward room.
    socket.on("leave_ward", (data: { wardId: number }) => {
      socket.leave(`ward:${data.wardId}`);
      console.log(`[socket] ${socket.id} left ward:${data.wardId}`);
    });

    // Join city-wide room (explicit — already auto-joined, but allows re-join).
    socket.on("join_city", () => {
      socket.join("city");
    });

    // Join a specific post room (for real-time updates on a single post).
    socket.on("join_post", (data: { postId: string }) => {
      socket.join(`post:${data.postId}`);
    });

    socket.on("leave_post", (data: { postId: string }) => {
      socket.leave(`post:${data.postId}`);
    });

    socket.on("disconnect", () => {
      console.log(`[socket] Client disconnected: ${socket.id}`);
    });
  });
}
