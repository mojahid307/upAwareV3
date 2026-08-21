"use client";

import Link from "next/link";
import { MapPin, Clock, ArrowUpRight } from "lucide-react";
import { useEmergency } from "@/hooks/useEmergency";

/**
 * List of currently active emergency alerts shown on the Emergency hub page.
 */
export function ActiveAlerts() {
  const { activeAlerts } = useEmergency();

  if (activeAlerts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-dark">All Clear</h3>
            <p className="mt-0.5 text-xs text-muted">
              No active emergencies in your area right now.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-dark">
        Active Alerts ({activeAlerts.length})
      </h2>
      {activeAlerts.map((alert, i) => {
        const timeAgo = getTimeAgo(alert.timestamp);
        return (
          <div
            key={alert.postId || i}
            className="flex items-start gap-3 rounded-xl border border-emergency/20 bg-emergency/5 p-4"
          >
            {/* Pulsing dot */}
            <div className="relative mt-1 flex h-5 w-5 shrink-0 items-center justify-center">
              <div className="absolute h-5 w-5 animate-pulse-ring rounded-full bg-emergency/40" />
              <div className="relative h-2.5 w-2.5 rounded-full bg-emergency" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-dark">
                {alert.description || "Emergency SOS Alert"}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {alert.lat.toFixed(4)}, {alert.lng.toFixed(4)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timeAgo}
                </span>
              </div>

              {alert.postId && (
                <Link
                  href={`/post/${alert.postId}`}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emergency hover:underline"
                >
                  View Details <ArrowUpRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}
