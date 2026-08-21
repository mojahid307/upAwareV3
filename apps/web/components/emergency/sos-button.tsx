"use client";

import { useCallback, useRef, useState } from "react";
import { useEmergency } from "@/hooks/useEmergency";

/**
 * SOS Button per spec:
 * - Large, red, circular
 * - 500ms press-and-hold to arm (prevents accidental triggers)
 * - Progress ring animation during hold
 * - Cancel on early release
 * - Confirmation modal on successful hold → trigger API
 */
export function SOSButton() {
  const { triggerEmergency } = useEmergency();
  const [pressing, setPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const holdTimer = useRef<NodeJS.Timeout | null>(null);
  const animFrame = useRef<number | null>(null);
  const startTime = useRef<number>(0);

  const HOLD_DURATION = 500; // ms

  const startHold = useCallback(() => {
    setPressing(true);
    setProgress(0);
    startTime.current = Date.now();

    // Animate progress ring.
    const animate = () => {
      const elapsed = Date.now() - startTime.current;
      const pct = Math.min(elapsed / HOLD_DURATION, 1);
      setProgress(pct);

      if (pct < 1) {
        animFrame.current = requestAnimationFrame(animate);
      }
    };
    animFrame.current = requestAnimationFrame(animate);

    // After HOLD_DURATION, show confirm modal.
    holdTimer.current = setTimeout(() => {
      setPressing(false);
      setProgress(1);
      setShowConfirm(true);
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    }, HOLD_DURATION);
  }, []);

  const cancelHold = useCallback(() => {
    setPressing(false);
    setProgress(0);
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    if (animFrame.current) {
      cancelAnimationFrame(animFrame.current);
      animFrame.current = null;
    }
  }, []);

  const confirmTrigger = useCallback(async () => {
    setIsTriggering(true);
    setError(null);
    try {
      // Use Dhaka center as fallback location.
      // In production, use navigator.geolocation.
      let lat = 23.8103;
      let lng = 90.4125;

      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            enableHighAccuracy: true,
          })
        );
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch {
        // Use fallback location.
      }

      await triggerEmergency(lat, lng);
      setTriggered(true);
      setShowConfirm(false);
    } catch (err: any) {
      setError(err.message || "Failed to trigger emergency");
    } finally {
      setIsTriggering(false);
    }
  }, [triggerEmergency]);

  // Already triggered state.
  if (triggered) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-emergency/10">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emergency text-white">
            <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-dark">Emergency Triggered</h3>
          <p className="mt-1 text-sm text-muted">
            Nearby users have been alerted. Help is on the way.
          </p>
        </div>
        <a
          href="tel:999"
          className="rounded-lg bg-emergency px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emergency/90"
        >
          Call 999
        </a>
        <button
          onClick={() => setTriggered(false)}
          className="text-sm text-muted hover:text-foreground"
        >
          Reset
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      {/* SOS Button */}
      <div className="relative flex items-center justify-center">
        {/* Progress ring */}
        <svg
          className="absolute h-36 w-36"
          viewBox="0 0 140 140"
          style={{ transform: "rotate(-90deg)" }}
        >
          {/* Background ring */}
          <circle
            cx="70"
            cy="70"
            r="62"
            fill="none"
            stroke="hsl(var(--emergency) / 0.15)"
            strokeWidth="6"
          />
          {/* Progress arc */}
          <circle
            cx="70"
            cy="70"
            r="62"
            fill="none"
            stroke="hsl(var(--emergency))"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 62}`}
            strokeDashoffset={`${2 * Math.PI * 62 * (1 - progress)}`}
            className="transition-all duration-75"
          />
        </svg>

        {/* Main button */}
        <button
          onMouseDown={startHold}
          onMouseUp={cancelHold}
          onMouseLeave={cancelHold}
          onTouchStart={startHold}
          onTouchEnd={cancelHold}
          className={`relative z-10 flex h-28 w-28 select-none items-center justify-center rounded-full border-4 text-white shadow-xl transition-all ${
            pressing
              ? "scale-95 border-emergency bg-emergency/90"
              : "border-emergency/30 bg-emergency hover:scale-105 hover:shadow-2xl active:scale-95"
          }`}
          aria-label="Hold to trigger SOS"
        >
          <div className="flex flex-col items-center">
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="mt-1 text-sm font-black tracking-wider">SOS</span>
          </div>
        </button>
      </div>

      <p className="text-center text-sm text-muted">
        {pressing
          ? "Keep holding…"
          : "Press & hold for 500ms to arm the emergency alert"}
      </p>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm animate-slide-up rounded-2xl bg-card p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emergency/10">
                <svg className="h-7 w-7 text-emergency" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-bold text-dark">
                Confirm Emergency?
              </h3>
              <p className="mt-2 text-sm text-muted">
                This will alert nearby users and emergency contacts.
                Only use for genuine emergencies.
              </p>

              {error && (
                <p className="mt-3 rounded-lg bg-emergency/10 px-3 py-2 text-sm text-emergency">
                  {error}
                </p>
              )}

              <div className="mt-6 flex w-full gap-3">
                <button
                  onClick={() => {
                    setShowConfirm(false);
                    setProgress(0);
                  }}
                  className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface"
                  disabled={isTriggering}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmTrigger}
                  disabled={isTriggering}
                  className="flex-1 rounded-lg bg-emergency px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emergency/90 disabled:opacity-50"
                >
                  {isTriggering ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Sending…
                    </span>
                  ) : (
                    "Confirm SOS"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
