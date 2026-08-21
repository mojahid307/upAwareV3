import Link from "next/link";
import { ArrowLeft, type LucideIcon } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description: string;
  icon: LucideIcon;
  /** Bullet list of what this section will contain per the spec. */
  features?: string[];
}

/**
 * Placeholder for routes scheduled in later phases (Map, Emergency, etc.).
 * Keeps the app navigable now and documents the planned scope.
 */
export function ComingSoon({ title, description, icon: Icon, features }: ComingSoonProps) {
  return (
    <div className="mx-auto max-w-lg py-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to feed
      </Link>

      <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-border bg-card p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Icon className="h-7 w-7 text-primary" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-dark">{title}</h1>
        <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p>

        {features && features.length > 0 && (
          <ul className="mt-6 w-full space-y-2 text-left">
            {features.map((f) => (
              <li
                key={f}
                className="flex items-start gap-2 rounded-lg bg-surface px-3 py-2 text-sm text-foreground/80"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {f}
              </li>
            ))}
          </ul>
        )}

        <span className="mt-6 rounded-full bg-active/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#a06b00]">
          Coming in a later phase
        </span>
      </div>
    </div>
  );
}
