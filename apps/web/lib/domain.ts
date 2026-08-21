import { Category, Severity, Status } from "@/types";

/**
 * Display metadata for the Category enum — color, label, and icon name.
 * Used by PostCard badges, the filter bar, and create-post picker.
 */
export const CATEGORY_META: Record<
  Category,
  { label: string; color: string; emoji: string }
> = {
  [Category.TRAFFIC]: { label: "Traffic", color: "#F5A623", emoji: "🚦" },
  [Category.INFRASTRUCTURE]: { label: "Infrastructure", color: "#5A6A7A", emoji: "🚧" },
  [Category.SAFETY]: { label: "Safety", color: "#E24B4A", emoji: "⚠️" },
  [Category.HEALTH]: { label: "Health", color: "#1D9E75", emoji: "🏥" },
  [Category.ENVIRONMENT]: { label: "Environment", color: "#1D9E75", emoji: "🌳" },
  [Category.CRIME]: { label: "Crime", color: "#E24B4A", emoji: "🚨" },
  [Category.OTHER]: { label: "Other", color: "#5A6A7A", emoji: "📌" },
};

export const CATEGORY_LIST = Object.values(Category).map((value) => ({
  value,
  ...CATEGORY_META[value],
}));

export const SEVERITY_META: Record<
  Severity,
  { label: string; color: string }
> = {
  [Severity.EMERGENCY]: { label: "Emergency", color: "#E24B4A" },
  [Severity.NORMAL]: { label: "Normal", color: "#F5A623" },
};

export const STATUS_META: Record<
  Status,
  { label: string; color: string; dotClass: string }
> = {
  [Status.OPEN]: { label: "Open", color: "#F5A623", dotClass: "bg-active" },
  [Status.IN_PROGRESS]: { label: "In Progress", color: "#1D9E75", dotClass: "bg-primary" },
  [Status.RESOLVED]: { label: "Resolved", color: "#1D9E75", dotClass: "bg-primary" },
};

export type FeedSort = "hot" | "new" | "top";

export { timeAgo, humanizeEnum, formatWard } from "@/lib/utils";
