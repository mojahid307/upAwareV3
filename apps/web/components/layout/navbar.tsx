"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { IS_MOCK } from "@/lib/api";
import { Languages, Trophy } from "lucide-react";

/**
 * Mobile-first top bar. Visible on all viewports.
 * Shows the brand, language switcher, mock-mode badge, and auth state.
 */
export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const onAuthPage =
    pathname === "/login" || pathname === "/register";

  if (onAuthPage) return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <BrandMark />
          <span className="text-lg font-semibold text-dark">{t.appName}</span>
          {IS_MOCK && (
            <span className="ml-1 rounded-full bg-active/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#a06b00]">
              demo
            </span>
          )}
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Toggle Button */}
          <button
            onClick={() => setLanguage(language === "en" ? "bn" : "en")}
            className="flex items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-bold text-dark transition-all hover:bg-card hover:border-primary/40"
            title="Toggle Language / ভাষা পরিবর্তন"
          >
            <Languages className="h-3.5 w-3.5 text-primary" />
            <span>{language === "en" ? "বাংলা" : "ENG"}</span>
          </button>

          {isAuthenticated && user ? (
            <>
              <Link
                href="/profile"
                className="hidden items-center gap-2 sm:flex"
                aria-label="Open profile"
              >
                <Avatar name={user.name} src={user.avatarUrl} size="sm" />
                <span className="text-sm font-medium text-dark">{user.name}</span>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}>
                {t.logout}
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">{t.login}</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">{t.register}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function BrandMark() {
  return (
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
  );
}
