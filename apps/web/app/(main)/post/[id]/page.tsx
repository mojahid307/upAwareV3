"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { fetchPost } from "@/lib/api";
import { PostDetailView } from "@/components/feed/post-detail-view";

export default function PostDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  const {
    data: post,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["posts", "detail", id],
    queryFn: () => fetchPost(id),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="h-6 w-24 animate-pulse rounded bg-surface" />
        <div className="h-72 animate-pulse rounded-2xl border border-border bg-card p-6" />
        <div className="h-44 animate-pulse rounded-2xl border border-border bg-card p-6" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emergency/10 text-emergency">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-base font-bold text-dark">Post Not Found</h2>
        <p className="mt-1 text-xs text-muted">
          The requested civic issue report does not exist or has been removed.
        </p>
        <Link
          href="/"
          className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Feed
        </Link>
      </div>
    );
  }

  return <PostDetailView post={post} />;
}

