import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../prisma/client";
import { validate } from "../middleware/validate";
import { verifyToken, getUser } from "../middleware/auth";

const router = Router();

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  ward: z.number().int().min(1).max(92).nullable().optional(),
  isVolunteer: z.boolean().optional(),
  fcmToken: z.string().optional(),
});

const leaderboardQuerySchema = z.object({
  ward: z.coerce.number().int().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

/* ─── GET /users/me ─── */

router.get("/me", verifyToken, async (req: Request, res: Response) => {
  try {
    const { userId } = getUser(req);
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ error: "User not found", code: "NOT_FOUND" });
      return;
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      ward: user.ward,
      role: user.role,
      isVolunteer: user.isVolunteer,
      points: user.points,
      avatarUrl: user.avatarUrl,
    });
  } catch (err) {
    console.error("[users/me]", err);
    res.status(500).json({ error: "Failed to fetch profile", code: "INTERNAL" });
  }
});

/* ─── PATCH /users/me ─── */

router.patch("/me", verifyToken, validate(updateUserSchema), async (req: Request, res: Response) => {
  try {
    const { userId } = getUser(req);
    const updated = await prisma.user.update({
      where: { id: userId },
      data: req.body,
    });

    res.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      ward: updated.ward,
      role: updated.role,
      isVolunteer: updated.isVolunteer,
      points: updated.points,
      avatarUrl: updated.avatarUrl,
    });
  } catch (err) {
    console.error("[users/update]", err);
    res.status(500).json({ error: "Failed to update profile", code: "INTERNAL" });
  }
});

/* ─── GET /users/leaderboard ─── */

router.get("/leaderboard", validate(leaderboardQuerySchema, "query"), async (req: Request, res: Response) => {
  try {
    const { ward, limit } = req.query as any;

    const where: any = {};
    if (ward) where.ward = ward;

    const users = await prisma.user.findMany({
      where,
      orderBy: { points: "desc" },
      take: limit,
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        ward: true,
        points: true,
        isVolunteer: true,
      },
    });

    res.json(users);
  } catch (err) {
    console.error("[users/leaderboard]", err);
    res.status(500).json({ error: "Failed to fetch leaderboard", code: "INTERNAL" });
  }
});

export default router;
