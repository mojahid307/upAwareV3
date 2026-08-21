import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../prisma/client";
import { validate } from "../middleware/validate";
import { verifyToken, getUser } from "../middleware/auth";

const router = Router();

/* ─── Schemas ─── */

const createCommentSchema = z.object({
  body: z.string().min(1).max(2000),
  isAnon: z.boolean().default(false),
  parentId: z.string().cuid().optional().nullable(),
});

const commentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

/* ─── GET /posts/:postId/comments ─── */

router.get("/:postId/comments", validate(commentsQuerySchema, "query"), async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { page, limit } = req.query as any;
    const skip = (page - 1) * limit;

    // Fetch top-level comments with replies
    const comments = await prisma.comment.findMany({
      where: {
        postId,
        parentId: null, // Top-level only; nested replies loaded through relations
      },
      skip,
      take: limit,
      orderBy: { createdAt: "asc" },
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true, role: true, isVolunteer: true },
        },
        replies: {
          orderBy: { createdAt: "asc" },
          include: {
            author: {
              select: { id: true, name: true, avatarUrl: true, role: true, isVolunteer: true },
            },
          },
        },
      },
    });

    const formatComment = (c: any) => ({
      id: c.id,
      body: c.body,
      isAnon: c.isAnon,
      postId: c.postId,
      parentId: c.parentId,
      author: c.isAnon ? { id: "anon", name: "Anonymous" } : c.author,
      createdAt: c.createdAt.toISOString(),
      replies: c.replies ? c.replies.map(formatComment) : [],
    });

    res.json(comments.map(formatComment));
  } catch (err) {
    console.error("[comments/list]", err);
    res.status(500).json({ error: "Failed to fetch comments", code: "INTERNAL" });
  }
});

/* ─── POST /posts/:postId/comments ─── */

router.post("/:postId/comments", verifyToken, validate(createCommentSchema), async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    const { postId } = req.params;
    const { body, isAnon, parentId } = req.body;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      res.status(404).json({ error: "Post not found", code: "NOT_FOUND" });
      return;
    }

    if (parentId) {
      const parent = await prisma.comment.findUnique({ where: { id: parentId } });
      if (!parent || parent.postId !== postId) {
        res.status(400).json({ error: "Invalid parent comment", code: "INVALID_PARENT" });
        return;
      }
    }

    // Create comment and reward author with +2 citizen karma points
    const [comment] = await prisma.$transaction([
      prisma.comment.create({
        data: {
          body,
          isAnon: !!isAnon,
          postId,
          parentId: parentId || null,
          authorId: user.userId,
        },
        include: {
          author: {
            select: { id: true, name: true, avatarUrl: true, role: true, isVolunteer: true },
          },
        },
      }),
      prisma.user.update({
        where: { id: user.userId },
        data: { points: { increment: 2 } },
      }),
    ]);

    const result = {
      id: comment.id,
      body: comment.body,
      isAnon: comment.isAnon,
      postId: comment.postId,
      parentId: comment.parentId,
      author: comment.isAnon ? { id: "anon", name: "Anonymous" } : comment.author,
      createdAt: comment.createdAt.toISOString(),
      replies: [],
    };

    // Emit real-time post update if socket.io is active
    const io = (req.app as any).io;
    if (io) {
      io.to(`post:${postId}`).emit("comment_added", { postId, comment: result });
    }

    res.status(201).json(result);
  } catch (err) {
    console.error("[comments/create]", err);
    res.status(500).json({ error: "Failed to create comment", code: "INTERNAL" });
  }
});

/* ─── DELETE /comments/:id ─── */

router.delete("/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });

    if (!comment) {
      res.status(404).json({ error: "Comment not found", code: "NOT_FOUND" });
      return;
    }

    if (comment.authorId !== user.userId && user.role !== "ADMIN") {
      res.status(403).json({ error: "Not authorized to delete this comment", code: "FORBIDDEN" });
      return;
    }

    // Delete nested replies first, then the comment
    await prisma.$transaction([
      prisma.comment.deleteMany({ where: { parentId: comment.id } }),
      prisma.comment.delete({ where: { id: comment.id } }),
    ]);

    res.status(204).end();
  } catch (err) {
    console.error("[comments/delete]", err);
    res.status(500).json({ error: "Failed to delete comment", code: "INTERNAL" });
  }
});

export default router;
