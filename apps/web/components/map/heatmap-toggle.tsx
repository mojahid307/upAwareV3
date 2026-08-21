"use client";

import { Layers, MapPin } from "lucide-react";

interface HeatmapToggleProps {
  active: boolean;
  onToggle: () => void;
}

/**
 * Toggle button to switch between pin view and heatmap overlay.
 * Positioned at top-left of the map container.
 */
export function HeatmapToggle({ active, onToggle }: HeatmapToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`absolute left-4 top-4 z-10 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold shadow-sm transition-all ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card/95 text-foreground backdrop-blur-sm hover:bg-surface"
      }`}
      title={active ? "Show pins" : "Show heatmap"}
    >
      {active ? (
        <>
          <MapPin className="h-3.5 w-3.5" />
          Show Pins
        </>
      ) : (
        <>
          <Layers className="h-3.5 w-3.5" />
          Heatmap
        </>
      )}
    </button>
  );
}
