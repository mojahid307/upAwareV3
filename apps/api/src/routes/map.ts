import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../prisma/client";
import { validate } from "../middleware/validate";

const router = Router();

const boundsSchema = z.object({
  swLat: z.coerce.number().min(-90).max(90),
  swLng: z.coerce.number().min(-180).max(180),
  neLat: z.coerce.number().min(-90).max(90),
  neLng: z.coerce.number().min(-180).max(180),
  severity: z.enum(["EMERGENCY", "NORMAL"]).optional(),
});

/**
 * GET /map/pins
 * Returns a GeoJSON FeatureCollection of all posts within the bounding box.
 */
router.get("/pins", validate(boundsSchema, "query"), async (req: Request, res: Response) => {
  try {
    const { swLat, swLng, neLat, neLng, severity } = req.query as any;

    const where: any = {
      lat: { gte: swLat, lte: neLat },
      lng: { gte: swLng, lte: neLng },
    };
    if (severity) where.severity = severity;

    const posts = await prisma.post.findMany({
      where,
      select: {
        id: true,
        title: true,
        category: true,
        severity: true,
        status: true,
        lat: true,
        lng: true,
        upvoteCount: true,
        ward: true,
        createdAt: true,
      },
    });

    const geojson = {
      type: "FeatureCollection" as const,
      features: posts.map((p) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [p.lng, p.lat],
        },
        properties: {
          id: p.id,
          title: p.title,
          category: p.category,
          severity: p.severity,
          status: p.status,
          upvoteCount: p.upvoteCount,
          ward: p.ward,
          createdAt: p.createdAt.toISOString(),
        },
      })),
    };

    res.json(geojson);
  } catch (err) {
    console.error("[map/pins]", err);
    res.status(500).json({ error: "Failed to fetch map pins", code: "INTERNAL" });
  }
});

/**
 * GET /map/heatmap
 * Returns GeoJSON points with upvoteCount as weight for heatmap rendering.
 */
router.get("/heatmap", validate(boundsSchema, "query"), async (req: Request, res: Response) => {
  try {
    const { swLat, swLng, neLat, neLng } = req.query as any;

    const posts = await prisma.post.findMany({
      where: {
        lat: { gte: swLat, lte: neLat },
        lng: { gte: swLng, lte: neLng },
      },
      select: {
        id: true,
        lat: true,
        lng: true,
        upvoteCount: true,
      },
    });

    const geojson = {
      type: "FeatureCollection" as const,
      features: posts.map((p) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [p.lng, p.lat],
        },
        properties: {
          upvoteCount: p.upvoteCount,
        },
      })),
    };

    res.json(geojson);
  } catch (err) {
    console.error("[map/heatmap]", err);
    res.status(500).json({ error: "Failed to fetch heatmap data", code: "INTERNAL" });
  }
});

export default router;
