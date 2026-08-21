"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Share2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Shield,
  HeartHandshake,
  Check,
} from "lucide-react";
import type { Post } from "@/types";
import { Status, Severity } from "@/types";
import { CATEGORY_META, timeAgo } from "@/lib/domain";
import { updatePostStatus } from "@/lib/api";
import { DHAKA_BOUNDS, MAP_STYLE } from "@/lib/mapbox";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useVote } from "@/hooks/usePosts";
import { useComments } from "@/hooks/useComments";
import { VoteButton } from "@/components/feed/vote-button";
import { AISuggestSection } from "@/components/ai/ai-suggest-button";
import { CommentList } from "@/components/comments/comment-list";

interface PostDetailViewProps {
  post: Post;
}

export function PostDetailView({ post: initialPost }: PostDetailViewProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [post, setPost] = useState<Post>(initialPost);
  const [copied, setCopied] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const miniMapContainer = useRef<HTMLDivElement>(null);
  const { toggleVote, isVoting } = useVote();
  const { comments, isLoading: isCommentsLoading, createComment, deleteComment } = useComments(post.id);

  const categoryMeta = CATEGORY_META[post.category];
  const canUpdateStatus =
    user?.role === "ADMIN" ||
    user?.role === "AUTHORITY" ||
    (user?.id && post.author.id === user.id);

  // Initialize mini map
  useEffect(() => {
    if (!miniMapContainer.current) return;

    let map: any;

    (async () => {
      try {
        const maplibregl = (await import("maplibre-gl")).default;

        map = new maplibregl.Map({
          container: miniMapContainer.current!,
          style: MAP_STYLE,
          center: [post.lng, post.lat],
          zoom: 14,
          maxBounds: DHAKA_BOUNDS,
          interactive: false,
        });

        // Marker pin
        const el = document.createElement("div");
        el.className = "flex items-center justify-center";
        const pinColor =
          post.status === Status.RESOLVED
            ? "#1D9E75"
            : post.severity === Severity.EMERGENCY
            ? "#E24B4A"
            : "#F5A623";

        el.innerHTML = `
          <div class="h-6 w-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold" style="background-color: ${pinColor}">
            <div class="h-2 w-2 rounded-full bg-white"></div>
          </div>
        `;

        new maplibregl.Marker({ element: el })
          .setLngLat([post.lng, post.lat])
          .addTo(map);
      } catch (err) {
        console.error("[PostDetailMiniMap]", err);
      }
    })();

    return () => {
      if (map) map.remove();
    };
  }, [post.lat, post.lng, post.severity, post.status]);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // user closed share dialog
    }
  };

  const handleStatusChange = async (newStatus: Status) => {
    setIsUpdatingStatus(true);
    try {
      const updated = await updatePostStatus(post.id, newStatus);
      setPost(updated);
    } catch (err) {
      console.error("[handleStatusChange]", err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to feed</span>
      </Link>

      {/* Main Post Card */}
      <article className="overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-sm">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {categoryMeta && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                style={{
                  backgroundColor: categoryMeta.color + "18",
                  color: categoryMeta.color,
                }}
              >
                <span>{categoryMeta.emoji}</span>
                {categoryMeta.label}
              </span>
            )}

            {post.severity === Severity.EMERGENCY && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emergency/15 px-2.5 py-0.5 text-xs font-bold text-emergency">
                <AlertTriangle className="h-3 w-3" />
                {t.severity_emergency}
              </span>
            )}

            {post.ward && (
              <Link
                href={`/ward/${post.ward}`}
                className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold text-muted hover:bg-primary/10 hover:text-primary transition-colors"
              >
                Ward {post.ward}
              </Link>
            )}
          </div>

          {/* Status Badge */}
          <span
            className="rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider"
            style={{
              backgroundColor:
                post.status === Status.RESOLVED
                  ? "#1D9E7518"
                  : post.status === Status.IN_PROGRESS
                  ? "#F5A62318"
                  : "#5A6A7A18",
              color:
                post.status === Status.RESOLVED
                  ? "#1D9E75"
                  : post.status === Status.IN_PROGRESS
                  ? "#d97706"
                  : "#5A6A7A",
            }}
          >
            {post.status.replace("_", " ")}
          </span>
        </div>

        {/* Title */}
        <h1 className="mt-4 text-xl font-bold leading-snug text-dark sm:text-2xl">
          {post.title}
        </h1>

        {/* Author / Metadata Row */}
        <div className="mt-3 flex flex-wrap items-center gap-3 border-b border-border/70 pb-4 text-xs text-muted">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
              {post.isAnon ? "?" : post.author.name.charAt(0)}
            </div>
            <span className="font-bold text-dark">
              {post.isAnon ? t.anonymous : post.author.name}
            </span>
          </div>

          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {timeAgo(post.createdAt)}
          </span>

          {post.address && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                {post.address}
              </span>
            </>
          )}
        </div>

        {/* Full Body Text */}
        <div className="mt-4 text-sm sm:text-base leading-relaxed text-foreground whitespace-pre-wrap">
          {post.body}
        </div>

        {/* Media Attachments Gallery */}
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {post.mediaUrls.map((url, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-border bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Attachment ${i + 1}`}
                  className="h-64 w-full object-cover transition-transform hover:scale-105"
                />
              </div>
            ))}
          </div>
        )}

        {/* Location Mini Map */}
        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2 text-xs font-semibold text-muted">
            <span className="flex items-center gap-1.5 text-dark font-bold">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Location ({post.lat.toFixed(4)}, {post.lng.toFixed(4)})
            </span>
            <Link href="/map" className="text-primary hover:underline">
              View on Full Map →
            </Link>
          </div>
          <div ref={miniMapContainer} className="h-44 w-full" />
        </div>

        {/* Action Row: Vote, Share, Status Controls */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/80 pt-4">
          <div className="flex items-center gap-3">
            <VoteButton post={post} />

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:bg-card hover:text-foreground"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Share2 className="h-3.5 w-3.5" />}
              <span>{copied ? t.copiedToClipboard : t.share}</span>
            </button>
          </div>

          {/* Status Change Controls (for Author / Authority) */}
          {canUpdateStatus && (
            <div className="flex items-center gap-1.5">
              {post.status !== Status.RESOLVED && (
                <button
                  onClick={() => handleStatusChange(Status.RESOLVED)}
                  disabled={isUpdatingStatus}
                  className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{t.markResolved}</span>
                </button>
              )}
              {post.status === Status.OPEN && (
                <button
                  onClick={() => handleStatusChange(Status.IN_PROGRESS)}
                  disabled={isUpdatingStatus}
                  className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-500/20"
                >
                  {t.markInProgress}
                </button>
              )}
              {post.status === Status.RESOLVED && (
                <button
                  onClick={() => handleStatusChange(Status.OPEN)}
                  disabled={isUpdatingStatus}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:bg-surface"
                >
                  {t.reopenIssue}
                </button>
              )}
            </div>
          )}
        </div>
      </article>

      {/* AI Suggestions Section (Phase 7) */}
      <AISuggestSection postId={post.id} aiAllowed={post.aiAllowed} />

      {/* Comments Section (Phase 8) */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-sm">
        <CommentList
          comments={comments}
          postId={post.id}
          isLoading={isCommentsLoading}
          currentUserId={user?.id}
          onAddComment={async (body, isAnon, parentId) => {
            await createComment({ body, isAnon, parentId });
          }}
          onDeleteComment={async (commentId) => {
            await deleteComment(commentId);
          }}
        />
      </div>
    </div>
  );
}
