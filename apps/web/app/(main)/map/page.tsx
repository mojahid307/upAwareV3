"use client";

import { MapView } from "@/components/map/map-view";

export default function MapPage() {
  return (
    <div className="-mx-4 -mt-4 flex h-[calc(100vh-3.5rem-4rem)] flex-col md:mx-0 md:mt-0 md:h-[calc(100vh-3.5rem-2rem)] md:rounded-xl md:overflow-hidden">
      <MapView />
    </div>
  );
}
