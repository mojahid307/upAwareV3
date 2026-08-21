import { Router, Request, Response } from "express";
import { prisma } from "../prisma/client";
import { verifyToken, getUser } from "../middleware/auth";

const router = Router();

/**
 * POST /posts/:id/vote — Toggle upvote.
 * If the user has already voted, the vote is removed.
 * If not, a new vote is created.
 * Uses a Prisma transaction to atomically update the post's upvoteCount.
 */
router.post("/:id/vote", verifyToken, async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    const postId = req.params.id;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      res.status(404).json({ error: "Post not found", code: "NOT_FOUND" });
      return;
    }

    const existingVote = await prisma.vote.findUnique({
      where: { userId_postId: { userId: user.userId, postId } },
    });

    if (existingVote) {
      // Remove vote.
      await prisma.$transaction([
        prisma.vote.delete({ where: { id: existingVote.id } }),
        prisma.post.update({
          where: { id: postId },
          data: { upvoteCount: { decrement: 1 } },
        }),
      ]);

      const updated = await prisma.post.findUnique({ where: { id: postId } });
      res.json({ upvoteCount: updated!.upvoteCount, hasVoted: false });
    } else {
      // Add vote + award 1 point to the post author.
      await prisma.$transaction([
        prisma.vote.create({ data: { userId: user.userId, postId } }),
        prisma.post.update({
          where: { id: postId },
          data: { upvoteCount: { increment: 1 } },
        }),
        prisma.user.update({
          where: { id: post.authorId },
          data: { points: { increment: 1 } },
        }),
      ]);

      const updated = await prisma.post.findUnique({ where: { id: postId } });
      res.json({ upvoteCount: updated!.upvoteCount, hasVoted: true });
    }

    // Emit real-time update.
    const io = (req.app as any).io;
    if (io) {
      const updated = await prisma.post.findUnique({ where: { id: postId } });
      if (updated) {
        io.to(`ward:${updated.ward}`).to(`post:${postId}`).emit("post_updated", {
          postId,
          status: updated.status,
          upvoteCount: updated.upvoteCount,
        });
      }
    }
  } catch (err) {
    console.error("[votes/toggle]", err);
    res.status(500).json({ error: "Failed to toggle vote", code: "INTERNAL" });
  }
});

export default router;
