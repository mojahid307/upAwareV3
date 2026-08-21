import { Router, Request, Response } from "express";
import { prisma } from "../prisma/client";
import { verifyToken } from "../middleware/auth";
import { getPostSuggestions } from "../services/claude";

const router = Router();

/**
 * POST /posts/:id/ai-suggest
 * Generates 3 actionable Dhaka-specific solution suggestions using Claude AI.
 * Explicit opt-in requirement: post.aiAllowed must be true.
 */
router.post("/:id/ai-suggest", verifyToken, async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        title: true,
        body: true,
        category: true,
        ward: true,
        address: true,
        aiAllowed: true,
      },
    });

    if (!post) {
      res.status(404).json({ error: "Post not found", code: "NOT_FOUND" });
      return;
    }

    if (!post.aiAllowed) {
      res.status(403).json({
        error: "AI suggestions have not been authorized by the post author",
        code: "AI_NOT_ALLOWED",
      });
      return;
    }

    const suggestions = await getPostSuggestions({
      title: post.title,
      body: post.body,
      category: post.category,
      ward: post.ward,
      address: post.address,
    });

    res.json({ suggestions });
  } catch (err) {
    console.error("[posts/ai-suggest]", err);
    res.status(500).json({ error: "Failed to generate AI suggestions", code: "INTERNAL" });
  }
});

export default router;
