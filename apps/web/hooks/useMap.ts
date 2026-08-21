"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Post } from "@/types";
import { MOCK_POSTS } from "@/lib/mock-data";
import { IS_MOCK } from "@/lib/api";

/** GeoJSON feature for a map pin. */
export interface PinFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    id: string;
    title: string;
    category: string;
    severity: string;
    status: string;
    upvoteCount: number;
    ward: number | null;
    createdAt: string;
  };
}

export interface GeoJSONCollection {
  type: "FeatureCollection";
  features: PinFeature[];
}

/** Convert mock posts into GeoJSON FeatureCollection. */
function postsToGeoJSON(posts: Post[]): GeoJSONCollection {
  return {
    type: "FeatureCollection",
    features: posts.map((p) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [p.lng, p.lat] as [number, number],
      },
      properties: {
        id: p.id,
        title: p.title,
        category: p.category,
        severity: p.severity,
        status: p.status,
        upvoteCount: p.upvoteCount,
        ward: p.ward ?? null,
        createdAt: p.createdAt,
      },
    })),
  };
}

/**
 * Hook that provides the GeoJSON pin data for the map.
 * In mock mode, converts MOCK_POSTS. In live mode, fetches from /map/pins.
 */
export function useMapData() {
  const [pinData, setPinData] = useState<GeoJSONCollection | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPins = useCallback(async (bounds?: {
    swLat: number;
    swLng: number;
    neLat: number;
    neLng: number;
  }) => {
    setIsLoading(true);
    try {
      if (IS_MOCK) {
        // Use mock data.
        await new Promise((r) => setTimeout(r, 300));
        setPinData(postsToGeoJSON(MOCK_POSTS));
      } else {
        const params = bounds
          ? `?swLat=${bounds.swLat}&swLng=${bounds.swLng}&neLat=${bounds.neLat}&neLng=${bounds.neLng}`
          : "?swLat=23.6&swLng=90.2&neLat=24.1&neLng=90.65";
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/map/pins${params}`
        );
        const data = await res.json();
        setPinData(data);
      }
    } catch (err) {
      console.error("[useMapData] Failed to fetch pins:", err);
      // Fallback to mock data.
      setPinData(postsToGeoJSON(MOCK_POSTS));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPins();
  }, [fetchPins]);

  return { pinData, isLoading, refetchPins: fetchPins };
}
