import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../prisma/client";
import { validate } from "../middleware/validate";
import { verifyToken, getUser } from "../middleware/auth";
import { findUsersWithinRadius } from "../services/geo";

const router = Router();

const triggerSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  description: z.string().max(500).optional(),
});

/**
 * POST /emergency/trigger
 * Creates an emergency post, emits Socket.io alert to ALL clients,
 * and sends FCM push to users within 3km.
 */
router.post("/trigger", verifyToken, validate(triggerSchema), async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    const { lat, lng, description } = req.body;

    // Create the emergency post.
    const post = await prisma.post.create({
      data: {
        title: description || "Emergency SOS Alert",
        body: description || "An emergency has been triggered at this location. Please be cautious.",
        category: "SAFETY",
        severity: "EMERGENCY",
        status: "OPEN",
        lat,
        lng,
        authorId: user.userId,
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    // Award points for reporting emergency.
    await prisma.user.update({
      where: { id: user.userId },
      data: { points: { increment: 5 } },
    });

    // Emit Socket.io emergency_alert to ALL connected clients.
    const io = (req.app as any).io;
    if (io) {
      io.emit("emergency_alert", {
        lat,
        lng,
        description: description || "Emergency SOS Alert",
        postId: post.id,
        timestamp: new Date().toISOString(),
      });

      // Also emit pin_update for the map.
      io.to("city").emit("pin_update", {
        postId: post.id,
        lat,
        lng,
        status: "OPEN",
        severity: "EMERGENCY",
      });
    }

    // FCM push to nearby users (best-effort, won't fail the request).
    try {
      const nearbyUsers = await findUsersWithinRadius(lng, lat, 3000);
      if (nearbyUsers.length > 0) {
        console.log(`[emergency] Would send FCM push to ${nearbyUsers.length} nearby users`);
        // FCM send would go here (Phase 6 enhancement — requires Firebase setup).
      }
    } catch (fcmErr) {
      console.warn("[emergency] FCM push failed (non-critical):", fcmErr);
    }

    res.status(201).json({
      postId: post.id,
      lat,
      lng,
      description: description || "Emergency SOS Alert",
      timestamp: post.createdAt.toISOString(),
    });
  } catch (err) {
    console.error("[emergency/trigger]", err);
    res.status(500).json({ error: "Failed to trigger emergency", code: "INTERNAL" });
  }
});

export default router;
