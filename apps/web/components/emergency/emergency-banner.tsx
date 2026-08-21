"use client";

import Link from "next/link";
import { X, MapPin, Phone } from "lucide-react";
import { useEmergency } from "@/hooks/useEmergency";

/**
 * Fixed-position emergency banner at the top of the viewport.
 * Per spec: red background, high z-index, shows active emergency
 * description + location, "View on Map" + "Call 999" buttons,
 * auto-dismisses after 30 min.
 */
export function EmergencyBanner() {
  const { activeAlerts, bannerVisible, dismissBanner } = useEmergency();

  if (!bannerVisible || activeAlerts.length === 0) return null;

  const latest = activeAlerts[0];

  return (
    <div className="fixed left-0 right-0 top-0 z-50 animate-slide-up bg-emergency text-white shadow-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5">
        {/* Pulsing indicator */}
        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
          <div className="absolute h-8 w-8 animate-pulse-ring rounded-full bg-white/30" />
          <div className="relative h-3 w-3 rounded-full bg-white" />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-tight">
            🚨 Emergency Alert
          </p>
          <p className="truncate text-xs font-medium opacity-90">
            {latest.description || "An emergency has been reported nearby"}
          </p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/map"
            className="flex items-center gap-1 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            <MapPin className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">View on Map</span>
          </Link>
          <a
            href="tel:999"
            className="flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-emergency transition-colors hover:bg-white/90"
          >
            <Phone className="h-3.5 w-3.5" />
            999
          </a>
          <button
            onClick={dismissBanner}
            className="rounded-full p-1 opacity-70 transition-opacity hover:opacity-100"
            aria-label="Dismiss emergency banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
