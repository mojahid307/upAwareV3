"use client";

import { MessageSquare } from "lucide-react";
import type { Comment } from "@/types";
import { useLanguage } from "@/lib/i18n";
import { CommentItem } from "./comment-item";
import { CommentForm } from "./comment-form";

interface CommentListProps {
  comments: Comment[];
  postId: string;
  onAddComment: (body: string, isAnon: boolean, parentId?: string | null) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
  currentUserId?: string;
  isLoading?: boolean;
}

export function CommentList({
  comments,
  postId,
  onAddComment,
  onDeleteComment,
  currentUserId,
  isLoading = false,
}: CommentListProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-primary" />
        <h3 className="text-base font-bold text-dark">
          {t.comments} ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
        </h3>
      </div>

      {/* Main Comment Input */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <CommentForm
          onSubmit={async (body, isAnon) => {
            await onAddComment(body, isAnon, null);
          }}
        />
      </div>

      {/* Comment List / Loading / Empty */}
      {isLoading ? (
        <div className="space-y-3 py-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-20 animate-pulse rounded-xl border border-border bg-surface" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted">
          No comments yet. Be the first to share an update or solution!
        </div>
      ) : (
        <div className="space-y-3.5">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={async (parentId, body, isAnon) => {
                await onAddComment(body, isAnon, parentId);
              }}
              onDelete={onDeleteComment}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
