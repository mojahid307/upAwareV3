"use client";

import { useEffect, useRef, useState } from "react";
import { X, Check, MapPin } from "lucide-react";
import { DHAKA_CENTER, DHAKA_BOUNDS, DEFAULT_ZOOM, MAP_STYLE } from "@/lib/mapbox";
import { useLanguage } from "@/lib/i18n";

interface LocationPickerModalProps {
  isOpen: boolean;
  initialLat?: number;
  initialLng?: number;
  onClose: () => void;
  onSelect: (lat: number, lng: number) => void;
}

export function LocationPickerModal({
  isOpen,
  initialLat = 23.8103,
  initialLng = 90.4125,
  onClose,
  onSelect,
}: LocationPickerModalProps) {
  const { t } = useLanguage();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number }>({
    lat: initialLat,
    lng: initialLng,
  });

  useEffect(() => {
    if (!isOpen) return;

    let map: any;

    (async () => {
      try {
        const maplibregl = (await import("maplibre-gl")).default;

        map = new maplibregl.Map({
          container: mapContainer.current!,
          style: MAP_STYLE,
          center: [initialLng, initialLat],
          zoom: DEFAULT_ZOOM + 1,
          maxBounds: DHAKA_BOUNDS,
        });

        map.addControl(new maplibregl.NavigationControl(), "top-right");

        // Custom draggable marker
        const el = document.createElement("div");
        el.className = "cursor-grab flex items-center justify-center";
        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            <div class="absolute -top-7 flex flex-col items-center">
              <div class="h-8 w-8 rounded-full bg-emerald-600 border-2 border-white shadow-lg flex items-center justify-center text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div class="h-2 w-2 bg-emerald-700 rotate-45 -mt-1"></div>
            </div>
          </div>
        `;

        const marker = new maplibregl.Marker({ element: el, draggable: true })
          .setLngLat([initialLng, initialLat])
          .addTo(map);

        marker.on("dragend", () => {
          const lngLat = marker.getLngLat();
          setSelectedCoords({ lat: Number(lngLat.lat.toFixed(5)), lng: Number(lngLat.lng.toFixed(5)) });
        });

        // Click anywhere on map to move marker
        map.on("click", (e: any) => {
          const { lng, lat } = e.lngLat;
          marker.setLngLat([lng, lat]);
          setSelectedCoords({ lat: Number(lat.toFixed(5)), lng: Number(lng.toFixed(5)) });
        });

        mapRef.current = map;
        markerRef.current = marker;
      } catch (err) {
        console.error("[LocationPickerModal] Map initialization error:", err);
      }
    })();

    return () => {
      if (map) map.remove();
    };
  }, [isOpen, initialLat, initialLng]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="flex h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="text-base font-bold text-dark">{t.postLocationLabel}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted hover:bg-surface hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Map View */}
        <div className="relative flex-1">
          <div ref={mapContainer} className="h-full w-full" />
          <div className="absolute top-3 left-3 z-10 rounded-lg bg-card/90 px-3 py-1.5 text-xs font-medium text-dark shadow backdrop-blur-sm border border-border">
            👆 Click anywhere or drag the pin to set issue location
          </div>
        </div>

        {/* Footer with selected coordinates & confirm button */}
        <div className="flex items-center justify-between border-t border-border bg-surface px-5 py-3.5">
          <div className="text-xs">
            <span className="text-muted">Selected Coordinates: </span>
            <span className="font-mono font-bold text-dark">
              {selectedCoords.lat.toFixed(4)}, {selectedCoords.lng.toFixed(4)}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-card"
            >
              {t.cancel}
            </button>
            <button
              onClick={() => {
                onSelect(selectedCoords.lat, selectedCoords.lng);
                onClose();
              }}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow hover:bg-primary/90"
            >
              <Check className="h-4 w-4" />
              Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
