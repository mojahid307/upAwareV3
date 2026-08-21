"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { NAV_ITEMS } from "@/components/layout/nav-config";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Desktop left sidebar — collapsible sections, mirrors the 4 primary nav items.
 * Hidden below the `md` breakpoint (mobile uses BottomNav instead).
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 flex-col border-r border-border bg-card md:flex">
      <nav className="flex flex-1 flex-col gap-1 p-3">
        <div className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-muted">
          Browse
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.matchPrefix);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/80 hover:bg-surface hover:text-foreground",
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <Button asChild className="w-full">
          <Link href="/post/new">
            <Plus className="h-4 w-4" /> Report an issue
          </Link>
        </Button>
      </div>
    </aside>
  );
}
