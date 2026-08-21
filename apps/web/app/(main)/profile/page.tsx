"use client";

import { useAuth } from "@/hooks/useAuth";
import { ProfileView } from "@/components/profile/profile-view";
import Link from "next/link";
import { LogIn } from "lucide-react";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="h-48 animate-pulse rounded-2xl border border-border bg-card" />
        <div className="h-64 animate-pulse rounded-2xl border border-border bg-card" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <LogIn className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-base font-bold text-dark">Please Log In</h2>
        <p className="mt-1 text-xs text-muted">
          Log in to view your citizen profile, karma points, and manage your reported issues.
        </p>
        <Link
          href="/login"
          className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow hover:bg-primary/90"
        >
          Log in to UpAware
        </Link>
      </div>
    );
  }

  return <ProfileView user={user} />;
}

