"use client";

import Link from "next/link";
import { X, ArrowUpRight, MessageSquare, ChevronUp } from "lucide-react";
import { CATEGORY_META } from "@/lib/domain";
import type { Category } from "@/types";

interface PinPopupProps {
  pin: {
    id: string;
    title: string;
    category: string;
    severity: string;
    status: string;
    upvoteCount: number;
    ward: number | null;
    createdAt: string;
  };
  position: { x: number; y: number };
  onClose: () => void;
}

/**
 * Popup card shown when clicking an unclustered map pin.
 * Displays post summary with a link to the full post detail page.
 */
export function PinPopup({ pin, position, onClose }: PinPopupProps) {
  const categoryMeta = CATEGORY_META[pin.category as Category];

  // Position the popup above the click point, clamped to viewport.
  const style: React.CSSProperties = {
    position: "absolute",
    left: Math.min(Math.max(position.x - 140, 12), window.innerWidth - 300),
    top: Math.max(position.y - 200, 12),
    zIndex: 20,
  };

  return (
    <div style={style} className="animate-slide-up">
      <div className="w-[280px] rounded-xl border border-border bg-card p-4 shadow-lg">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-2 top-2 rounded-full p-1 text-muted hover:bg-surface hover:text-foreground"
          aria-label="Close popup"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* Category badge */}
        <div className="flex items-center gap-2">
          {categoryMeta && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
              style={{
                backgroundColor: categoryMeta.color + "18",
                color: categoryMeta.color,
              }}
            >
              <span>{categoryMeta.emoji}</span>
              {categoryMeta.label}
            </span>
          )}
          {pin.severity === "EMERGENCY" && (
            <span className="rounded-full bg-emergency/15 px-2 py-0.5 text-[11px] font-bold text-emergency">
              🚨 Emergency
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-dark">
          {pin.title}
        </h3>

        {/* Stats row */}
        <div className="mt-2.5 flex items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1">
            <ChevronUp className="h-3.5 w-3.5 text-primary" />
            {pin.upvoteCount}
          </span>
          {pin.ward && (
            <span>Ward {pin.ward}</span>
          )}
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
            style={{
              backgroundColor:
                pin.status === "RESOLVED"
                  ? "#1D9E7518"
                  : pin.status === "IN_PROGRESS"
                    ? "#1D9E7518"
                    : "#F5A62318",
              color:
                pin.status === "RESOLVED" || pin.status === "IN_PROGRESS"
                  ? "#1D9E75"
                  : "#a06b00",
            }}
          >
            {pin.status.replace("_", " ")}
          </span>
        </div>

        {/* View link */}
        <Link
          href={`/post/${pin.id}`}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          View Post <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
