"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Trophy,
  Medal,
  Award,
  HeartHandshake,
  Shield,
  MapPin,
  Flame,
  ArrowLeft,
} from "lucide-react";
import { fetchLeaderboard } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";

export default function LeaderboardPage() {
  const { t } = useLanguage();
  const [selectedWard, setSelectedWard] = useState<number | undefined>(undefined);

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["leaderboard", selectedWard],
    queryFn: () => fetchLeaderboard(selectedWard),
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <Trophy className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-dark sm:text-3xl">
              {t.topContributors}
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted">
            Recognizing citizens actively reporting and resolving civic issues across Dhaka.
          </p>
        </div>

        {/* Ward Filter Selector */}
        <select
          value={selectedWard ?? ""}
          onChange={(e) =>
            setSelectedWard(e.target.value ? Number(e.target.value) : undefined)
          }
          className="rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-dark shadow-sm focus:border-primary focus:outline-none"
        >
          <option value="">{t.allDhaka}</option>
          {Array.from({ length: 92 }, (_, i) => i + 1).map((w) => (
            <option key={w} value={w}>
              Ward {w}
            </option>
          ))}
        </select>
      </div>

      {/* Leaderboard Table / Cards */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {isLoading ? (
          <div className="space-y-2 p-5">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="h-14 animate-pulse rounded-xl bg-surface" />
            ))}
          </div>
        ) : !leaderboard || leaderboard.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted">
            No contributor records found for this ward.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {leaderboard.map((u, idx) => {
              const isTopThree = idx < 3;
              const medalColors = [
                "bg-amber-500/20 text-amber-600 border-amber-500/40",
                "bg-slate-300/40 text-slate-700 border-slate-300",
                "bg-amber-700/20 text-amber-800 border-amber-700/30",
              ];

              return (
                <div
                  key={u.id}
                  className={`flex items-center justify-between p-4 sm:px-6 transition-colors hover:bg-surface/50 ${
                    idx === 0 ? "bg-amber-500/5" : ""
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Rank Badge */}
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-black text-xs border ${
                        isTopThree
                          ? medalColors[idx]
                          : "border-border bg-surface text-muted"
                      }`}
                    >
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                    </div>

                    {/* User Avatar + Info */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-xs">
                        {u.name.charAt(0)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-dark">{u.name}</span>
                          {u.isVolunteer && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                              <HeartHandshake className="h-3 w-3" />
                              Volunteer
                            </span>
                          )}
                          {u.role === "AUTHORITY" && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                              <Shield className="h-3 w-3" />
                              Authority
                            </span>
                          )}
                        </div>

                        {u.ward && (
                          <Link
                            href={`/ward/${u.ward}`}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-muted hover:text-primary transition-colors"
                          >
                            <MapPin className="h-3 w-3" />
                            Ward {u.ward}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="text-right">
                    <span className="font-mono text-base font-black text-primary sm:text-lg">
                      {u.points}
                    </span>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-muted">
                      {t.points}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
