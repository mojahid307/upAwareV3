"use client";

import { AlertCircle, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useFeed } from "@/hooks/usePosts";
import { PostCard } from "@/components/feed/post-card";
import { PostCardSkeleton } from "@/components/feed/post-card-skeleton";
import { FeedFilter, type FeedFilterValue } from "@/components/feed/feed-filter";
import { Button } from "@/components/ui/button";
import { toApiError } from "@/lib/api";
import { Category } from "@/types";

/**
 * The home feed: filter bar + list of PostCards with per-section skeletons.
 * Falls back to an empty state and surfaces API errors inline.
 */
export function FeedList() {
  const [filter, setFilter] = useState<FeedFilterValue>({
    sort: "hot",
    category: "ALL",
  });

  const { data, isLoading, isError, error, refetch } = useFeed({
    sort: filter.sort,
    category: filter.category === "ALL" ? undefined : (filter.category as Category),
  });

  return (
    <div className="space-y-4">
      <FeedFilter value={filter} onChange={setFilter} />

      {isLoading ? (
        <div className="space-y-4">
          <PostCardSkeleton count={3} />
        </div>
      ) : isError ? (
        <ErrorState
          message={toApiError(error).error}
          onRetry={() => void refetch()}
        />
      ) : data && data.length > 0 ? (
        <div className="space-y-3">
          {data.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-8 text-center">
      <AlertCircle className="h-8 w-8 text-emergency" />
      <p className="mt-3 text-sm font-medium text-dark">Couldn&apos;t load posts</p>
      <p className="mt-1 max-w-sm text-xs text-muted">{message}</p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Plus className="h-6 w-6 text-primary" />
      </div>
      <p className="mt-3 text-sm font-medium text-dark">No posts here yet</p>
      <p className="mt-1 text-xs text-muted">
        Be the first to report an issue in this area.
      </p>
      <Button asChild size="sm" className="mt-4">
        <Link href="/post/new">
          <Plus className="h-4 w-4" /> Report an issue
        </Link>
      </Button>
    </div>
  );
}
