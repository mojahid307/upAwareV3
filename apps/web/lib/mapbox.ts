/**
 * Map configuration for UpAware.
 * Uses OpenFreeMap (free, no API key) + MapLibre GL JS.
 * Centers on Dhaka, Bangladesh with bounded navigation.
 */

export const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

export const DHAKA_CENTER: [number, number] = [90.4125, 23.8103];

export const DHAKA_BOUNDS: [[number, number], [number, number]] = [
  [90.2, 23.6],   // SW corner
  [90.65, 24.1],  // NE corner
];

export const DEFAULT_ZOOM = 12;

/** Pin colors matching the spec's Map Pin Logic table. */
export const PIN_COLORS = {
  emergency: "#E24B4A",  // red — severity=EMERGENCY, status=OPEN
  active: "#F5A623",     // amber — severity=NORMAL, status≠RESOLVED
  resolved: "#1D9E75",   // teal — status=RESOLVED
} as const;

/** Cluster circle color. */
export const CLUSTER_COLOR = "#1D9E75";

/** Heatmap color ramp from teal → amber → red. */
export const HEATMAP_COLORS = {
  low: "rgba(29,158,117,0)",
  mid: "#F5A623",
  high: "#E24B4A",
} as const;
