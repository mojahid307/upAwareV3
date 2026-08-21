"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { IS_MOCK } from "@/lib/api";
import { MOCK_POSTS } from "@/lib/mock-data";
import type { EmergencyAlert } from "@/hooks/useSocket";

/** 30 minutes in ms — auto-dismiss timer per spec. */
const AUTO_DISMISS_MS = 30 * 60 * 1000;

interface EmergencyState {
  /** Currently active emergency alerts. */
  activeAlerts: EmergencyAlert[];
  /** Whether the banner is visible. */
  bannerVisible: boolean;
  /** Dismiss the banner (user action). */
  dismissBanner: () => void;
  /** Trigger a new emergency (from SOS button). */
  triggerEmergency: (lat: number, lng: number, description?: string) => Promise<void>;
  /** Handle incoming Socket.io emergency alert. */
  handleEmergencyAlert: (alert: EmergencyAlert) => void;
}

const EmergencyContext = createContext<EmergencyState | null>(null);

export function EmergencyProvider({ children }: { children: ReactNode }) {
  const [activeAlerts, setActiveAlerts] = useState<EmergencyAlert[]>([]);
  const [bannerVisible, setBannerVisible] = useState(false);

  // Auto-dismiss timer for each alert.
  useEffect(() => {
    if (activeAlerts.length === 0) return;

    const timers = activeAlerts.map((alert) => {
      const alertAge = Date.now() - new Date(alert.timestamp).getTime();
      const remaining = Math.max(AUTO_DISMISS_MS - alertAge, 0);
      return setTimeout(() => {
        setActiveAlerts((prev) => prev.filter((a) => a !== alert));
      }, remaining);
    });

    return () => timers.forEach(clearTimeout);
  }, [activeAlerts]);

  // Show banner when alerts exist.
  useEffect(() => {
    if (activeAlerts.length > 0) {
      setBannerVisible(true);
    } else {
      setBannerVisible(false);
    }
  }, [activeAlerts]);

  const dismissBanner = useCallback(() => {
    setBannerVisible(false);
  }, []);

  const handleEmergencyAlert = useCallback((alert: EmergencyAlert) => {
    setActiveAlerts((prev) => {
      // Avoid duplicates by postId.
      if (alert.postId && prev.some((a) => a.postId === alert.postId)) {
        return prev;
      }
      return [alert, ...prev];
    });
  }, []);

  const triggerEmergency = useCallback(
    async (lat: number, lng: number, description?: string) => {
      if (IS_MOCK) {
        // Mock: create a local emergency alert.
        await new Promise((r) => setTimeout(r, 500));
        const mockAlert: EmergencyAlert = {
          lat,
          lng,
          description: description || "Emergency SOS Alert",
          postId: `emergency_${Date.now()}`,
          timestamp: new Date().toISOString(),
        };
        handleEmergencyAlert(mockAlert);
        return;
      }

      // Live: POST to backend.
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("ua_access")
          : null;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/emergency/trigger`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ lat, lng, description }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to trigger emergency");
      }

      // The Socket.io event will handle adding it to active alerts.
    },
    [handleEmergencyAlert]
  );

  const value = useMemo<EmergencyState>(
    () => ({
      activeAlerts,
      bannerVisible,
      dismissBanner,
      triggerEmergency,
      handleEmergencyAlert,
    }),
    [activeAlerts, bannerVisible, dismissBanner, triggerEmergency, handleEmergencyAlert]
  );

  return (
    <EmergencyContext.Provider value={value}>
      {children}
    </EmergencyContext.Provider>
  );
}

export function useEmergency(): EmergencyState {
  const ctx = useContext(EmergencyContext);
  if (!ctx)
    throw new Error("useEmergency must be used within <EmergencyProvider>");
  return ctx;
}
