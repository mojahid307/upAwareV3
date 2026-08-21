"use client";

import { ChevronUp } from "lucide-react";
import { useToggleVote } from "@/hooks/usePosts";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { Post } from "@/types";

/**
 * Triangle-up vote button per spec:
 *  - teal when voted, gray when not
 *  - optimistic update on click — revert if API fails
 *  - count shown beside the button
 * Requires auth; non-authenticated clicks prompt login via the auth flow.
 */
interface VoteButtonProps {
  post: Post;
  size?: "sm" | "md";
}

export function VoteButton({ post, size = "md" }: VoteButtonProps) {
  const toggle = useToggleVote();
  const { isAuthenticated } = useAuth();

  const handleClick = () => {
    if (!isAuthenticated) {
      // Soft prompt — routing to login is handled by the post-detail context.
      window.location.href = "/login";
      return;
    }
    toggle.mutate(post);
  };

  const pending = toggle.isPending && toggle.variables?.id === post.id;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-pressed={post.hasVoted}
      aria-label={post.hasVoted ? "Remove upvote" : "Upvote"}
      className={cn(
        "group inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium transition-colors",
        size === "sm" ? "text-xs" : "text-sm",
        post.hasVoted
          ? "text-primary"
          : "text-muted hover:text-primary",
      )}
    >
      <ChevronUp
        className={cn(
          size === "sm" ? "h-4 w-4" : "h-5 w-5",
          "transition-transform group-hover:-translate-y-0.5",
          post.hasVoted && "fill-primary/20",
        )}
      />
      <span className={cn("tabular-nums", pending && "opacity-60")}>
        {post.upvoteCount}
      </span>
    </button>
  );
}
