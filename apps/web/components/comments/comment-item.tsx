"use client";

import { useState } from "react";
import { MessageSquare, Trash2, Shield, HeartHandshake } from "lucide-react";
import type { Comment } from "@/types";
import { timeAgo } from "@/lib/domain";
import { useLanguage } from "@/lib/i18n";
import { CommentForm } from "./comment-form";

interface CommentItemProps {
  comment: Comment;
  onReply: (parentId: string, body: string, isAnon: boolean) => Promise<void>;
  onDelete?: (commentId: string) => Promise<void>;
  currentUserId?: string;
  isNested?: boolean;
}

export function CommentItem({
  comment,
  onReply,
  onDelete,
  currentUserId,
  isNested = false,
}: CommentItemProps) {
  const { t } = useLanguage();
  const [showReplyForm, setShowReplyForm] = useState(false);

  const canDelete = currentUserId && comment.author?.id === currentUserId;

  return (
    <div className={`space-y-2.5 ${isNested ? "border-l-2 border-border/80 pl-3.5 sm:pl-4 mt-2.5" : ""}`}>
      <div className="rounded-xl border border-border/70 bg-card p-3.5 sm:p-4 transition-all hover:border-border">
        {/* Comment Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
              {comment.isAnon ? "?" : comment.author?.name?.charAt(0) || "U"}
            </div>
            <span className="text-xs font-bold text-dark">
              {comment.isAnon ? t.anonymous : comment.author?.name || "Anonymous"}
            </span>

            {comment.author?.isVolunteer && !comment.isAnon && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                <HeartHandshake className="h-3 w-3" />
                Volunteer
              </span>
            )}
            {comment.author?.role === "AUTHORITY" && !comment.isAnon && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                <Shield className="h-3 w-3" />
                Authority
              </span>
            )}

            <span className="text-[11px] text-muted">• {timeAgo(comment.createdAt)}</span>
          </div>

          {canDelete && onDelete && (
            <button
              onClick={() => onDelete(comment.id)}
              className="rounded p-1 text-muted hover:bg-surface hover:text-emergency"
              title="Delete comment"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Comment Body */}
        <p className="mt-2 text-xs leading-relaxed text-foreground sm:text-sm">
          {comment.body}
        </p>

        {/* Reply Trigger */}
        {!isNested && (
          <div className="mt-2.5 flex items-center gap-3">
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1 text-[11px] font-semibold text-muted hover:text-primary transition-colors"
            >
              <MessageSquare className="h-3 w-3" />
              <span>{t.reply}</span>
            </button>
          </div>
        )}
      </div>

      {/* Reply input box */}
      {showReplyForm && (
        <div className="border-l-2 border-primary/40 pl-3.5 pt-1">
          <CommentForm
            isReply
            parentId={comment.id}
            onCancelReply={() => setShowReplyForm(false)}
            placeholder={`Reply to ${comment.isAnon ? "Anonymous" : comment.author?.name}...`}
            onSubmit={async (body, isAnon) => {
              await onReply(comment.id, body, isAnon);
              setShowReplyForm(false);
            }}
          />
        </div>
      )}

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2 pt-1">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              isNested
              onReply={onReply}
              onDelete={onDelete}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
