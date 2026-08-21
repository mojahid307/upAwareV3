import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Split layout for auth screens: brand panel on the left (hidden on mobile),
 * form on the right. The form area has no AppShell so login/register are clean.
 */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden flex-col justify-between bg-primary p-10 text-primary-foreground md:flex">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/15">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 2a7 7 0 0 0-7 7c0 4.5 7 13 7 13s7-8.5 7-13a7 7 0 0 0-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
          </span>
          <span className="text-xl font-semibold">UpAware</span>
        </Link>

        <div>
          <h2 className="max-w-sm text-2xl font-bold leading-snug">
            Community-powered civic awareness for Dhaka.
          </h2>
          <p className="mt-3 max-w-sm text-sm text-primary-foreground/80">
            Report issues, see them on a live map, and alert your neighbours in
            emergencies — together, we keep the city informed.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-primary-foreground/90">
            <li>📍 Pin problems to a live, color-coded map</li>
            <li>🚨 One-tap SOS alerts to nearby residents</li>
            <li>🗳️ Upvote and amplify what matters in your ward</li>
          </ul>
        </div>

        <p className="text-xs text-primary-foreground/60">
          A Software Development course project · Dhaka, Bangladesh
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center bg-surface p-6">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <Link href="/" className="mb-8 flex items-center justify-center gap-2 md:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 2a7 7 0 0 0-7 7c0 4.5 7 13 7 13s7-8.5 7-13a7 7 0 0 0-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
            </span>
            <span className="text-lg font-semibold text-dark">UpAware</span>
          </Link>

          <h1 className="text-2xl font-bold text-dark">{title}</h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>

          <div className="mt-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
