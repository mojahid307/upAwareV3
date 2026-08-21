"use client";

/**
 * Pulsing red ring marker for active emergency locations.
 * This component creates a CSS-animated overlay positioned at
 * given pixel coordinates on the map.
 */

interface EmergencyRingProps {
  /** Pixel position on the map canvas. */
  x: number;
  y: number;
  /** Whether the ring is currently visible. */
  visible: boolean;
}

export function EmergencyRing({ x, y, visible }: EmergencyRingProps) {
  if (!visible) return null;

  return (
    <div
      className="pointer-events-none absolute z-10"
      style={{
        left: x - 24,
        top: y - 24,
      }}
    >
      {/* Pulsing ring */}
      <div className="relative flex h-12 w-12 items-center justify-center">
        <div className="absolute h-12 w-12 animate-pulse-ring rounded-full bg-emergency/40" />
        <div
          className="absolute h-12 w-12 animate-pulse-ring rounded-full bg-emergency/30"
          style={{ animationDelay: "0.4s" }}
        />
        <div className="relative h-4 w-4 rounded-full border-2 border-white bg-emergency shadow-lg" />
      </div>
    </div>
  );
}
