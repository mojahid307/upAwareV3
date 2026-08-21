"use client";

import { useEffect, useRef, useState } from "react";
import {
  DHAKA_CENTER,
  DHAKA_BOUNDS,
  DEFAULT_ZOOM,
  MAP_STYLE,
  PIN_COLORS,
  CLUSTER_COLOR,
  HEATMAP_COLORS,
} from "@/lib/mapbox";
import { useMapData } from "@/hooks/useMap";
import { PinPopup } from "./pin-popup";
import { HeatmapToggle } from "./heatmap-toggle";

/**
 * Full-screen interactive map with:
 * - OpenFreeMap tiles (free, no API key)
 * - MapLibre GL JS renderer
 * - Color-coded pins (red/amber/teal)
 * - Cluster circles when zoomed out
 * - Heatmap overlay toggle
 * - Click-to-view popup
 */
export function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [heatmapVisible, setHeatmapVisible] = useState(false);
  const [selectedPin, setSelectedPin] = useState<any>(null);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);
  const [mapError, setMapError] = useState(false);
  const { pinData, isLoading } = useMapData();

  // Initialize MapLibre GL dynamically (client-side only).
  useEffect(() => {
    if (!mapContainer.current) return;

    let map: any;

    (async () => {
      try {
        const maplibregl = (await import("maplibre-gl")).default;

        map = new maplibregl.Map({
          container: mapContainer.current!,
          style: MAP_STYLE,
          center: DHAKA_CENTER,
          zoom: DEFAULT_ZOOM,
          maxBounds: DHAKA_BOUNDS,
        });

        map.addControl(new maplibregl.NavigationControl(), "top-right");
        map.addControl(
          new maplibregl.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            trackUserLocation: true,
          }),
          "top-right"
        );

        map.on("load", () => {
          mapRef.current = map;
          setMapLoaded(true);
          addLayers(map);
        });
      } catch (err) {
        console.error("[MapView] Failed to initialize MapLibre:", err);
        setMapError(true);
      }
    })();

    return () => {
      if (map) map.remove();
    };
  }, []);

  // Update map data when pinData changes.
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !pinData) return;
    const map = mapRef.current;
    const source = map.getSource("posts");
    if (source) {
      source.setData(pinData);
    }
  }, [pinData, mapLoaded]);

  // Toggle heatmap visibility.
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;
    if (map.getLayer("heatmap")) {
      map.setLayoutProperty(
        "heatmap",
        "visibility",
        heatmapVisible ? "visible" : "none"
      );
      // Hide/show pins when heatmap is toggled.
      map.setLayoutProperty(
        "unclustered-pins",
        "visibility",
        heatmapVisible ? "none" : "visible"
      );
      map.setLayoutProperty(
        "clusters",
        "visibility",
        heatmapVisible ? "none" : "visible"
      );
      map.setLayoutProperty(
        "cluster-count",
        "visibility",
        heatmapVisible ? "none" : "visible"
      );
    }
  }, [heatmapVisible, mapLoaded]);

  function addLayers(map: any) {
    // Source.
    map.addSource("posts", {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    });

    // Cluster circles.
    map.addLayer({
      id: "clusters",
      type: "circle",
      source: "posts",
      filter: ["has", "point_count"],
      paint: {
        "circle-color": CLUSTER_COLOR,
        "circle-radius": ["step", ["get", "point_count"], 20, 10, 30, 50, 40],
        "circle-opacity": 0.85,
      },
    });

    // Cluster count labels.
    map.addLayer({
      id: "cluster-count",
      type: "symbol",
      source: "posts",
      filter: ["has", "point_count"],
      layout: {
        "text-field": ["get", "point_count_abbreviated"],
        "text-size": 13,
      },
      paint: {
        "text-color": "#ffffff",
      },
    });

    // Individual unclustered pins — color-coded by severity/status.
    map.addLayer({
      id: "unclustered-pins",
      type: "circle",
      source: "posts",
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": [
          "case",
          ["==", ["get", "status"], "RESOLVED"],
          PIN_COLORS.resolved,
          ["==", ["get", "severity"], "EMERGENCY"],
          PIN_COLORS.emergency,
          PIN_COLORS.active,
        ],
        "circle-radius": 8,
        "circle-stroke-width": 2.5,
        "circle-stroke-color": "#ffffff",
      },
    });

    // Heatmap layer (hidden by default).
    map.addLayer({
      id: "heatmap",
      type: "heatmap",
      source: "posts",
      maxzoom: 14,
      layout: { visibility: "none" },
      paint: {
        "heatmap-weight": [
          "interpolate",
          ["linear"],
          ["get", "upvoteCount"],
          0,
          0,
          50,
          1,
        ],
        "heatmap-intensity": 1.5,
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0,
          HEATMAP_COLORS.low,
          0.4,
          HEATMAP_COLORS.mid,
          1,
          HEATMAP_COLORS.high,
        ],
        "heatmap-radius": 25,
      },
    });

    // Click on unclustered pin → show popup.
    map.on("click", "unclustered-pins", (e: any) => {
      if (!e.features || e.features.length === 0) return;
      const feature = e.features[0];
      const { x, y } = e.point;
      setSelectedPin(feature.properties);
      setPopupPosition({ x, y });
    });

    // Click on cluster → zoom in.
    map.on("click", "clusters", async (e: any) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ["clusters"],
      });
      if (!features.length) return;
      const clusterId = features[0].properties.cluster_id;
      try {
        // MapLibre uses a promise-based API for getClusterExpansionZoom.
        const zoom = await map.getSource("posts").getClusterExpansionZoom(clusterId);
        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom,
        });
      } catch {
        // Fallback: just zoom in a bit.
        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: map.getZoom() + 2,
        });
      }
    });

    // Cursor pointer on hoverable layers.
    map.on("mouseenter", "unclustered-pins", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "unclustered-pins", () => {
      map.getCanvas().style.cursor = "";
    });
    map.on("mouseenter", "clusters", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "clusters", () => {
      map.getCanvas().style.cursor = "";
    });

    // Click on map background → close popup.
    map.on("click", (e: any) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ["unclustered-pins", "clusters"],
      });
      if (!features.length) {
        setSelectedPin(null);
        setPopupPosition(null);
      }
    });
  }

  // Error state.
  if (mapError) {
    return (
      <div className="flex h-full min-h-[60vh] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emergency/10">
          <svg className="h-7 w-7 text-emergency" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="mt-4 text-lg font-bold text-dark">Map Failed to Load</h2>
        <p className="mt-1.5 max-w-sm text-sm text-muted">
          There was an issue loading the map. Please check your internet connection and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[60vh] w-full overflow-hidden rounded-xl border border-border">
      {/* Map container */}
      <div ref={mapContainer} className="h-full w-full" style={{ minHeight: "60vh" }} />

      {/* Loading overlay */}
      {(isLoading || !mapLoaded) && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary" />
            <span className="text-sm font-medium text-muted">Loading map…</span>
          </div>
        </div>
      )}

      {/* Heatmap toggle */}
      {mapLoaded && (
        <HeatmapToggle
          active={heatmapVisible}
          onToggle={() => setHeatmapVisible((v) => !v)}
        />
      )}

      {/* Pin popup */}
      {selectedPin && popupPosition && (
        <PinPopup
          pin={selectedPin}
          position={popupPosition}
          onClose={() => {
            setSelectedPin(null);
            setPopupPosition(null);
          }}
        />
      )}

      {/* Map legend */}
      <div className="absolute bottom-4 left-4 z-10 rounded-lg border border-border bg-card/95 px-3 py-2 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: PIN_COLORS.emergency }} />
            Emergency
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: PIN_COLORS.active }} />
            Active
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: PIN_COLORS.resolved }} />
            Resolved
          </span>
        </div>
      </div>
    </div>
  );
}

