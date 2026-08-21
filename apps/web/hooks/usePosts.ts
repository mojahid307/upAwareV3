"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createPost, fetchPost, fetchPosts, toggleVote, type FeedQuery } from "@/lib/api";
import type { Post } from "@/types";
import type { FeedSort } from "@/lib/domain";

/** Stable query key for a feed request. */
export function feedKey(query: FeedQuery) {
  return ["posts", "feed", query] as const;
}

/** Fetch the main feed with optional filters/sort. */
export function useFeed(query: FeedQuery = {}) {
  return useQuery({
    queryKey: feedKey(query),
    queryFn: () => fetchPosts(query),
  });
}

/** Fetch a single post by id. */
export function usePost(id: string) {
  return useQuery({
    queryKey: ["posts", "detail", id],
    queryFn: () => fetchPost(id),
    enabled: !!id,
  });
}

/**
 * Toggle upvote with optimistic UI per spec:
 * "Voting should update UI immediately, revert on API error."
 * We derive the optimistic next state from the cached post.
 */
export function useToggleVote() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (post: Post) => toggleVote(post.id),
    onMutate: async (post) => {
      // Invalidate nothing — we patch the cache in place.
      await qc.cancelQueries({ queryKey: ["posts"] });

      const hasVoted = !post.hasVoted;
      const upvoteCount = post.upvoteCount + (hasVoted ? 1 : -1);
      const patch = (p: Post): Post =>
        p.id === post.id ? { ...p, hasVoted, upvoteCount } : p;

      // Patch every feed cache (each stores a Post[]) and the detail cache (single Post).
      qc.setQueriesData<Post[]>({ queryKey: ["posts", "feed"] }, (old) =>
        old ? old.map(patch) : old,
      );
      qc.setQueryData<Post>(["posts", "detail", post.id], (old) => old ? patch(old) : old);

      return { hasVoted, upvoteCount };
    },
    onError: (_e, post, ctx) => {
      // Revert: flip back to the original values.
      const patch = (p: Post): Post =>
        p.id === post.id
          ? { ...p, hasVoted: post.hasVoted, upvoteCount: post.upvoteCount }
          : p;
      qc.setQueriesData<Post[]>({ queryKey: ["posts", "feed"] }, (old) =>
        old ? old.map(patch) : old,
      );
      qc.setQueryData<Post>(["posts", "detail", post.id], (old) => old ? patch(old) : old);
      void ctx;
    },
    onSettled: (post) => {
      // Refresh the specific detail so server stays source of truth.
      if (post) qc.invalidateQueries({ queryKey: ["posts", "detail"] });
    },
  });
}

/** Create a new post; invalidates the feed so it appears at the top. */
export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts", "feed"] });
    },
  });
}

export function useVote() {
  const mutation = useToggleVote();
  return {
    toggleVote: mutation.mutateAsync,
    isVoting: mutation.isPending,
  };
}

export type { FeedSort };
