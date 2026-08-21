"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare, Share2, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { VoteButton } from "@/components/feed/vote-button";
import { CATEGORY_META, STATUS_META } from "@/lib/domain";
import { cn, formatWard, humanizeEnum, timeAgo } from "@/lib/utils";
import type { Post } from "@/types";
import { Severity, Status } from "@/types";

/**
 * Feed PostCard per spec:
 *  - avatar (or "Anonymous") + name + time
 *  - title (bold), body preview (2 lines, truncated)
 *  - category badge (color-coded) + severity indicator
 *  - bottom row: VoteButton, CommentCount, Share, Ward label
 */
export function PostCard({ post }: { post: Post }) {
  const [imageError, setImageError] = useState(false);
  const category = CATEGORY_META[post.category];
  const status = STATUS_META[post.status];
  const isEmergency = post.severity === Severity.EMERGENCY;

  const authorName = post.isAnon ? "Anonymous" : post.author.name;
  const authorAvatar = post.isAnon ? null : post.author.avatarUrl;

  const validPhotos = (post.mediaUrls || []).filter(
    (url): url is string => typeof url === "string" && url.trim().length > 0
  );
  const hasPhotos = validPhotos.length > 0 && !imageError;
  const primaryPhoto = hasPhotos ? validPhotos[0] : null;
  const photoCount = validPhotos.length;

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      // user dismissed the share sheet — no-op
    }
  };

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-md hover:border-border/80">
      <div className="p-4 sm:p-5">
        {/* Header: author + time */}
        <div className="flex items-center gap-3">
          <Avatar name={authorName} src={authorAvatar} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-semibold text-dark">
                {authorName}
              </span>
              {isEmergency && (
                <Badge variant="emergency" className="shrink-0 font-bold">
                  SOS
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted">
              {timeAgo(post.createdAt)} · {formatWard(post.ward)}
            </div>
          </div>
        </div>

        {/* Main Content: Desktop flex with right-side thumbnail; Mobile stacked */}
        <div className="mt-3 md:flex md:items-start md:justify-between md:gap-4">
          {/* Text Content */}
          <Link href={`/post/${post.id}`} className="block flex-1 min-w-0">
            <h3 className="text-base font-semibold leading-snug text-dark transition-colors group-hover:text-primary">
              {post.title}
            </h3>
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">
              {post.body}
            </p>
          </Link>

          {/* Desktop Right-Side Photo Thumbnail */}
          {primaryPhoto && (
            <Link
              href={`/post/${post.id}`}
              className="relative hidden md:block shrink-0 overflow-hidden rounded-xl border border-border/80 bg-surface shadow-inner"
            >
              <div className="relative h-28 w-28 lg:h-32 lg:w-32 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={primaryPhoto}
                  alt={post.title}
                  onError={() => setImageError(true)}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                {photoCount > 1 && (
                  <span className="absolute bottom-1.5 right-1.5 rounded-md bg-dark/80 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm shadow">
                    +{photoCount - 1}
                  </span>
                )}
              </div>
            </Link>
          )}
        </div>

        {/* Mobile Full-Width Photo Preview */}
        {primaryPhoto && (
          <Link
            href={`/post/${post.id}`}
            className="relative mt-3 block overflow-hidden rounded-xl border border-border/80 bg-surface md:hidden"
          >
            <div className="relative h-48 w-full overflow-hidden sm:h-56">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={primaryPhoto}
                alt={post.title}
                onError={() => setImageError(true)}
                className="h-full w-full object-cover transition-transform duration-300 active:scale-95"
                loading="lazy"
              />
              {photoCount > 1 && (
                <span className="absolute bottom-2 right-2 rounded-lg bg-dark/80 px-2 py-0.5 text-xs font-bold text-white backdrop-blur-sm shadow">
                  📷 {photoCount} photos
                </span>
              )}
            </div>
          </Link>
        )}

        {/* Tags row */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          <Badge
            variant="muted"
            style={{ color: category.color }}
            className="border-transparent font-medium"
          >
            <span aria-hidden="true">{category.emoji}</span>
            {category.label}
          </Badge>
          <span className="inline-flex items-center gap-1 text-xs text-muted">
            <span
              className={cn("badge-dot", status.dotClass)}
              aria-hidden="true"
            />
            {status.label}
          </span>
        </div>

        {/* Action row */}
        <div className="mt-3.5 flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-center gap-1">
            <VoteButton post={post} size="sm" />
          </div>
          <div className="flex items-center gap-4 text-xs text-muted">
            <Link
              href={`/post/${post.id}`}
              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="tabular-nums font-medium">{post.commentCount ?? 0}</span>
            </Link>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
              aria-label="Share post"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span className="truncate max-w-[140px] sm:max-w-xs">{post.address ?? formatWard(post.ward)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Thin severity stripe — full width, top edge accent */}
      {isEmergency && post.status !== Status.RESOLVED && (
        <span
          className="block h-1 w-full bg-emergency"
          aria-hidden="true"
        />
      )}
    </Card>
  );
}
