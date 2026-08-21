"use client";

import { useEffect, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "@/lib/socket";
import type { Post } from "@/types";

export interface EmergencyAlert {
  lat: number;
  lng: number;
  description?: string;
  postId?: string;
  timestamp: string;
}

/**
 * Hook to manage Socket.io subscriptions.
 * - Joins the city room on mount
 * - Optionally joins a ward room
 * - Listens for new_post, post_updated, pin_update, emergency_alert
 * - Invalidates TanStack Query caches on events for seamless real-time updates
 *
 * @param wardId  Optional ward to subscribe to
 * @param onEmergency  Callback when an emergency_alert event fires
 */
export function useSocket(
  wardId?: number,
  onEmergency?: (alert: EmergencyAlert) => void
) {
  const qc = useQueryClient();
  const onEmergencyRef = useRef(onEmergency);
  onEmergencyRef.current = onEmergency;

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Join rooms.
    socket.emit("join_city", {});
    if (wardId) {
      socket.emit("join_ward", { wardId });
    }

    // Feed updates: new post arrived.
    const handleNewPost = (data: { post: Post }) => {
      qc.invalidateQueries({ queryKey: ["posts", "feed"] });
    };

    // Post updated (upvote count, status change).
    const handlePostUpdated = (data: {
      postId: string;
      status: string;
      upvoteCount: number;
    }) => {
      qc.invalidateQueries({ queryKey: ["posts", "detail", data.postId] });
      qc.invalidateQueries({ queryKey: ["posts", "feed"] });
    };

    // Map pin moved/changed.
    const handlePinUpdate = () => {
      // The map hook re-fetches on invalidation.
      qc.invalidateQueries({ queryKey: ["map"] });
    };

    // Emergency alert — fire callback.
    const handleEmergency = (alert: EmergencyAlert) => {
      onEmergencyRef.current?.(alert);
    };

    socket.on("new_post", handleNewPost);
    socket.on("post_updated", handlePostUpdated);
    socket.on("pin_update", handlePinUpdate);
    socket.on("emergency_alert", handleEmergency);

    return () => {
      socket.off("new_post", handleNewPost);
      socket.off("post_updated", handlePostUpdated);
      socket.off("pin_update", handlePinUpdate);
      socket.off("emergency_alert", handleEmergency);

      if (wardId) {
        socket.emit("leave_ward", { wardId });
      }
    };
  }, [wardId, qc]);
}
