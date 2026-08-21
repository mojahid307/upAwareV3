"use client";

import { useState } from "react";
import { Send, UserCheck, Shield } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface CommentFormProps {
  onSubmit: (body: string, isAnon: boolean) => Promise<void>;
  parentId?: string;
  isReply?: boolean;
  onCancelReply?: () => void;
  placeholder?: string;
}

export function CommentForm({
  onSubmit,
  parentId,
  isReply = false,
  onCancelReply,
  placeholder,
}: CommentFormProps) {
  const { t } = useLanguage();
  const [body, setBody] = useState("");
  const [isAnon, setIsAnon] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(body.trim(), isAnon);
      setBody("");
      if (isReply && onCancelReply) {
        onCancelReply();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      <div className="relative">
        <textarea
          rows={isReply ? 2 : 3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={placeholder || t.writeComment}
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-medium text-foreground placeholder:text-muted focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 sm:text-sm"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted hover:text-foreground">
          <input
            type="checkbox"
            checked={isAnon}
            onChange={(e) => setIsAnon(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary"
          />
          <span>{t.postAnonLabel}</span>
        </label>

        <div className="flex items-center gap-2">
          {isReply && onCancelReply && (
            <button
              type="button"
              onClick={onCancelReply}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted hover:bg-surface"
            >
              {t.cancel}
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !body.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            <span>{isReply ? t.reply : t.postComment}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
