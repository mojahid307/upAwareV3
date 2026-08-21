"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Phone,
  ArrowLeft,
  ChevronDown,
  Layers,
} from "lucide-react";
import { fetchPosts, fetchWardInfo } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { PostCard } from "@/components/feed/post-card";
import { PostCardSkeleton } from "@/components/feed/post-card-skeleton";

export default function WardCirclePage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();

  const rawId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);
  const wardNumber = parseInt(rawId || "4", 10);

  const { data: wardInfo, isLoading: isWardLoading } = useQuery({
    queryKey: ["ward", wardNumber],
    queryFn: () => fetchWardInfo(wardNumber),
    enabled: !isNaN(wardNumber),
  });

  const { data: posts, isLoading: isPostsLoading } = useQuery({
    queryKey: ["posts", "feed", { ward: wardNumber }],
    queryFn: () => fetchPosts({ ward: wardNumber }),
    enabled: !isNaN(wardNumber),
  });

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newWard = e.target.value;
    router.push(`/ward/${newWard}`);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Top Breadcrumb & Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to city feed</span>
        </Link>

        {/* Quick Ward Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted font-medium">{t.switchWard}:</span>
          <select
            value={wardNumber}
            onChange={handleWardChange}
            className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-bold text-dark shadow-sm focus:border-primary focus:outline-none"
          >
            {Array.from({ length: 92 }, (_, i) => i + 1).map((w) => (
              <option key={w} value={w}>
                Ward {w}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ward Hero Card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary">
                <Building className="h-3.5 w-3.5" />
                Dhaka Ward {wardNumber}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-dark sm:text-3xl">
              {wardInfo?.name || `Dhaka Ward ${wardNumber} Community`}
            </h1>
            {wardInfo?.areaNames && (
              <p className="text-xs text-muted">
                Coverage: {wardInfo.areaNames.join(" • ")}
              </p>
            )}
          </div>

          <Link
            href="/post/new"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow hover:bg-primary/90"
          >
            + Report in Ward {wardNumber}
          </Link>
        </div>

        {/* Ward Metrics Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-border/80 pt-6">
          <div className="rounded-xl bg-surface p-3.5 text-center">
            <p className="text-[11px] font-medium text-muted uppercase">{t.totalReports}</p>
            <p className="mt-1 text-xl font-bold text-dark">{wardInfo?.totalPosts ?? (posts?.length || 0)}</p>
          </div>
          <div className="rounded-xl bg-amber-500/10 p-3.5 text-center">
            <p className="text-[11px] font-medium text-amber-700 dark:text-amber-300 uppercase">{t.activeIssues}</p>
            <p className="mt-1 text-xl font-bold text-amber-800 dark:text-amber-200">{wardInfo?.openIssues ?? 0}</p>
          </div>
          <div className="rounded-xl bg-emerald-500/10 p-3.5 text-center">
            <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 uppercase">{t.resolvedIssues}</p>
            <p className="mt-1 text-xl font-bold text-emerald-800 dark:text-emerald-200">{wardInfo?.resolvedIssues ?? 0}</p>
          </div>
          <div className="rounded-xl bg-surface p-3.5 text-center">
            <p className="text-[11px] font-medium text-muted uppercase">Citizens</p>
            <p className="mt-1 text-xl font-bold text-dark">450+</p>
          </div>
        </div>

        {/* Local Office Contact Information */}
        {wardInfo?.councillorOffice && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-surface/50 p-3.5 text-xs">
            <div className="flex items-center gap-2 text-muted">
              <Building className="h-4 w-4 text-primary shrink-0" />
              <span>{wardInfo.councillorOffice}</span>
            </div>
            {wardInfo.emergencyPhone && (
              <a
                href={`tel:${wardInfo.emergencyPhone}`}
                className="flex items-center gap-1 font-bold text-primary hover:underline"
              >
                <Phone className="h-3 w-3" />
                <span>{wardInfo.emergencyPhone}</span>
              </a>
            )}
          </div>
        )}
      </div>

      {/* Ward Feed List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-dark flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Ward {wardNumber} Issues Feed
          </h2>
          <span className="text-xs text-muted">
            {posts?.length || 0} issues reported
          </span>
        </div>

        {isPostsLoading ? (
          <div className="space-y-4">
            <PostCardSkeleton />
            <PostCardSkeleton />
          </div>
        ) : !posts || posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-dark">No Issues in Ward {wardNumber}</h3>
            <p className="mt-1 text-xs text-muted">
              No civic issues have been reported for this ward yet.
            </p>
            <Link
              href="/post/new"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
            >
              Be the first to report
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
