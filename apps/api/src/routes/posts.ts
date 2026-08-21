import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../prisma/client";
import { validate } from "../middleware/validate";
import { verifyToken, getUser } from "../middleware/auth";

const router = Router();

/* ─── Schemas ─── */

const feedQuerySchema = z.object({
  ward: z.coerce.number().int().optional(),
  category: z.enum(["TRAFFIC", "INFRASTRUCTURE", "SAFETY", "HEALTH", "ENVIRONMENT", "CRIME", "OTHER"]).optional(),
  severity: z.enum(["EMERGENCY", "NORMAL"]).optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]).optional(),
  sort: z.enum(["hot", "new", "top"]).default("hot"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

const createPostSchema = z.object({
  title: z.string().min(5).max(200),
  body: z.string().min(10).max(5000),
  category: z.enum(["TRAFFIC", "INFRASTRUCTURE", "SAFETY", "HEALTH", "ENVIRONMENT", "CRIME", "OTHER"]),
  severity: z.enum(["EMERGENCY", "NORMAL"]).default("NORMAL"),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  address: z.string().max(200).optional(),
  ward: z.number().int().min(1).max(92).optional(),
  isAnon: z.boolean().default(false),
  aiAllowed: z.boolean().default(false),
  mediaUrls: z.array(z.string()).optional().default([]),
});

const updatePostSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]).optional(),
  resolvedNote: z.string().max(500).optional(),
});

/* ─── GET /posts ─── */

router.get("/", validate(feedQuerySchema, "query"), async (req: Request, res: Response) => {
  try {
    const { ward, category, severity, status, sort, page, limit } = req.query as any;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (ward) where.ward = ward;
    if (category) where.category = category;
    if (severity) where.severity = severity;
    if (status) where.status = status;

    const orderBy: any =
      sort === "new"
        ? { createdAt: "desc" }
        : sort === "top"
          ? { upvoteCount: "desc" }
          : [{ upvoteCount: "desc" }, { createdAt: "desc" }]; // "hot"

    const posts = await prisma.post.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { comments: true } },
      },
    });

    // Optionally attach `hasVoted` if user is authenticated.
    const userId = (req as any).user?.userId;
    let votedPostIds = new Set<string>();
    if (userId) {
      const votes = await prisma.vote.findMany({
        where: { userId, postId: { in: posts.map((p) => p.id) } },
        select: { postId: true },
      });
      votedPostIds = new Set(votes.map((v) => v.postId));
    }

    const result = posts.map((p) => ({
      id: p.id,
      title: p.title,
      body: p.body,
      category: p.category,
      severity: p.severity,
      status: p.status,
      lat: p.lat,
      lng: p.lng,
      address: p.address,
      ward: p.ward,
      mediaUrls: p.mediaUrls,
      isAnon: p.isAnon,
      aiAllowed: p.aiAllowed,
      upvoteCount: p.upvoteCount,
      author: p.isAnon ? { id: "anon", name: "Anonymous" } : p.author,
      hasVoted: votedPostIds.has(p.id),
      commentCount: p._count.comments,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    res.json(result);
  } catch (err) {
    console.error("[posts/list]", err);
    res.status(500).json({ error: "Failed to fetch posts", code: "INTERNAL" });
  }
});

/* ─── POST /posts ─── */

router.post("/", verifyToken, validate(createPostSchema), async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    const data = req.body;

    const post = await prisma.post.create({
      data: { ...data, authorId: user.userId },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    const result = {
      ...post,
      author: data.isAnon ? { id: "anon", name: "Anonymous" } : post.author,
      hasVoted: false,
      commentCount: 0,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };

    // Emit real-time event if socket.io is attached.
    const io = (req.app as any).io;
    if (io) {
      io.to("city").emit("new_post", { post: result });
      if (post.ward) {
        io.to(`ward:${post.ward}`).emit("new_post", { post: result });
      }
      io.to("city").emit("pin_update", {
        postId: post.id,
        lat: post.lat,
        lng: post.lng,
        status: post.status,
        severity: post.severity,
      });
    }

    res.status(201).json(result);
  } catch (err) {
    console.error("[posts/create]", err);
    res.status(500).json({ error: "Failed to create post", code: "INTERNAL" });
  }
});

/* ─── GET /posts/:id ─── */

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { comments: true } },
      },
    });

    if (!post) {
      res.status(404).json({ error: "Post not found", code: "NOT_FOUND" });
      return;
    }

    const userId = (req as any).user?.userId;
    let hasVoted = false;
    if (userId) {
      const vote = await prisma.vote.findUnique({
        where: { userId_postId: { userId, postId: post.id } },
      });
      hasVoted = !!vote;
    }

    res.json({
      ...post,
      author: post.isAnon ? { id: "anon", name: "Anonymous" } : post.author,
      hasVoted,
      commentCount: post._count.comments,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    });
  } catch (err) {
    console.error("[posts/get]", err);
    res.status(500).json({ error: "Failed to fetch post", code: "INTERNAL" });
  }
});

/* ─── PATCH /posts/:id ─── */

router.patch("/:id", verifyToken, validate(updatePostSchema), async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });

    if (!post) {
      res.status(404).json({ error: "Post not found", code: "NOT_FOUND" });
      return;
    }

    // Only author, AUTHORITY, or ADMIN can update.
    if (post.authorId !== user.userId && user.role !== "AUTHORITY" && user.role !== "ADMIN") {
      res.status(403).json({ error: "Not authorized to update this post", code: "FORBIDDEN" });
      return;
    }

    const updated = await prisma.post.update({
      where: { id: req.params.id },
      data: req.body,
    });

    // Emit real-time update.
    const io = (req.app as any).io;
    if (io) {
      io.to(`ward:${updated.ward}`).to(`post:${updated.id}`).emit("post_updated", {
        postId: updated.id,
        status: updated.status,
        upvoteCount: updated.upvoteCount,
      });
      io.to("city").emit("pin_update", {
        postId: updated.id,
        lat: updated.lat,
        lng: updated.lng,
        status: updated.status,
        severity: updated.severity,
      });
    }

    res.json({
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (err) {
    console.error("[posts/update]", err);
    res.status(500).json({ error: "Failed to update post", code: "INTERNAL" });
  }
});

/* ─── DELETE /posts/:id ─── */

router.delete("/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });

    if (!post) {
      res.status(404).json({ error: "Post not found", code: "NOT_FOUND" });
      return;
    }

    if (post.authorId !== user.userId && user.role !== "ADMIN") {
      res.status(403).json({ error: "Not authorized to delete this post", code: "FORBIDDEN" });
      return;
    }

    // Delete related votes and comments first, then the post.
    await prisma.$transaction([
      prisma.vote.deleteMany({ where: { postId: post.id } }),
      prisma.comment.deleteMany({ where: { postId: post.id } }),
      prisma.post.delete({ where: { id: post.id } }),
    ]);

    res.status(204).end();
  } catch (err) {
    console.error("[posts/delete]", err);
    res.status(500).json({ error: "Failed to delete post", code: "INTERNAL" });
  }
});

export default router;
