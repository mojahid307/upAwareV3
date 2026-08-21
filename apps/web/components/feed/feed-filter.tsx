"use client";

import { CATEGORY_LIST } from "@/lib/domain";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";
import type { FeedSort } from "@/lib/domain";
import { useLanguage } from "@/lib/i18n";

export interface FeedFilterValue {
  sort: FeedSort;
  category: Category | "ALL";
}

interface FeedFilterProps {
  value: FeedFilterValue;
  onChange: (next: FeedFilterValue) => void;
}

/**
 * Sticky filter bar above the feed: sort tabs (Hot/New/Top) + a horizontal
 * category scroller. Mobile-first — categories scroll instead of wrapping.
 */
export function FeedFilter({ value, onChange }: FeedFilterProps) {
  const { t, language } = useLanguage();

  const sorts: { value: FeedSort; label: string }[] = [
    { value: "hot", label: t.hot },
    { value: "new", label: t.new },
    { value: "top", label: t.top },
  ];

  return (
    <div className="space-y-3">
      {/* Sort tabs */}
      <div className="flex items-center gap-1 rounded-lg bg-surface p-1">
        {sorts.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => onChange({ ...value, sort: s.value })}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              value.sort === s.value
                ? "bg-card text-dark shadow-sm font-semibold"
                : "text-muted hover:text-foreground",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Category chips */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        <CategoryChip
          active={value.category === "ALL"}
          onClick={() => onChange({ ...value, category: "ALL" })}
        >
          {t.cat_all}
        </CategoryChip>
        {CATEGORY_LIST.map((c) => (
          <CategoryChip
            key={c.value}
            active={value.category === c.value}
            onClick={() => onChange({ ...value, category: c.value })}
          >
            <span aria-hidden="true">{c.emoji}</span>
            {language === "bn" ? (t as any)[`cat_${c.value.toLowerCase()}`] || c.label : c.label}
          </CategoryChip>
        ))}
      </div>
    </div>
  );
}

function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-card text-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
