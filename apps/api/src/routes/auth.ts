import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../prisma/client";
import { validate } from "../middleware/validate";
import { verifyToken, getUser } from "../middleware/auth";

const router = Router();

/* ─── Schemas ─── */

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(128),
  ward: z.number().int().min(1).max(92).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

/* ─── Helpers ─── */

function signTokens(userId: string, role: string) {
  const accessToken = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET!,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    { userId, role },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
}

function userResponse(user: any) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    ward: user.ward,
    role: user.role,
    isVolunteer: user.isVolunteer,
    points: user.points,
    avatarUrl: user.avatarUrl,
  };
}

/* ─── POST /auth/register ─── */

router.post("/register", validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const { name, email, password, ward } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: "Email already registered", code: "EMAIL_EXISTS" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, ward },
    });

    const tokens = signTokens(user.id, user.role);
    res.status(201).json({ ...tokens, user: userResponse(user) });
  } catch (err) {
    console.error("[auth/register]", err);
    res.status(500).json({ error: "Registration failed", code: "INTERNAL" });
  }
});

/* ─── POST /auth/login ─── */

router.post("/login", validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      res.status(401).json({ error: "Invalid email or password", code: "INVALID_CREDENTIALS" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid email or password", code: "INVALID_CREDENTIALS" });
      return;
    }

    const tokens = signTokens(user.id, user.role);
    res.json({ ...tokens, user: userResponse(user) });
  } catch (err) {
    console.error("[auth/login]", err);
    res.status(500).json({ error: "Login failed", code: "INTERNAL" });
  }
});

/* ─── POST /auth/refresh ─── */

router.post("/refresh", validate(refreshSchema), async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
      userId: string;
      role: string;
    };

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      res.status(401).json({ error: "User not found", code: "UNAUTHORIZED" });
      return;
    }

    const tokens = signTokens(user.id, user.role);
    res.json({ ...tokens, user: userResponse(user) });
  } catch {
    res.status(401).json({ error: "Invalid refresh token", code: "UNAUTHORIZED" });
  }
});

export default router;
