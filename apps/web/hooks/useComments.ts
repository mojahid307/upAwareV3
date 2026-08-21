"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchComments, createComment, deleteComment } from "@/lib/api";
import type { Comment } from "@/types";

export function useComments(postId: string) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => fetchComments(postId),
    enabled: Boolean(postId),
  });

  const createMutation = useMutation({
    mutationFn: (input: { body: string; isAnon?: boolean; parentId?: string | null }) =>
      createComment(postId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", postId] });
      qc.invalidateQueries({ queryKey: ["posts", "detail", postId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", postId] });
      qc.invalidateQueries({ queryKey: ["posts", "detail", postId] });
    },
  });

  return {
    comments: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createComment: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteComment: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
