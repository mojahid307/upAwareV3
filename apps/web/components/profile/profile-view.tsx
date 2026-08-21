"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Award,
  HeartHandshake,
  MapPin,
  Mail,
  Shield,
  Edit3,
  Check,
  X,
  FileText,
  ThumbsUp,
  Sparkles,
} from "lucide-react";
import type { User } from "@/types";
import { useLanguage } from "@/lib/i18n";
import { updateProfile } from "@/lib/api";
import { MOCK_POSTS } from "@/lib/mock-data";
import { useFeed } from "@/hooks/usePosts";
import { PostCard } from "@/components/feed/post-card";

interface ProfileViewProps {
  user: User;
  onUserUpdated?: (updated: User) => void;
}

export function ProfileView({ user: initialUser, onUserUpdated }: ProfileViewProps) {
  const { t } = useLanguage();
  const { data: allPosts } = useFeed();
  const [user, setUser] = useState<User>(initialUser);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "upvoted">("posts");

  const [name, setName] = useState(user.name);
  const [ward, setWard] = useState<number>(user.ward || 33);
  const [isVolunteer, setIsVolunteer] = useState(user.isVolunteer);
  const [isSaving, setIsSaving] = useState(false);

  // User's authored posts and upvoted posts
  const postsPool = allPosts || MOCK_POSTS;
  const myPosts = postsPool.filter((p) => p.author.id === user.id || p.author.name === user.name);
  const myUpvoted = postsPool.filter((p) => p.hasVoted);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await updateProfile({
        name,
        ward,
        isVolunteer,
      });
      setUser(updated);
      setIsEditing(false);
      onUserUpdated?.(updated);
    } catch (err) {
      console.error("[updateProfile]", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      {/* Profile Header Card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 text-2xl font-black text-primary shadow-inner">
              {user.name.charAt(0)}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-dark sm:text-2xl">{user.name}</h1>
                {user.isVolunteer && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    <HeartHandshake className="h-3.5 w-3.5" />
                    Volunteer
                  </span>
                )}
                {user.role === "ADMIN" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-bold text-purple-700 dark:text-purple-300">
                    <Shield className="h-3.5 w-3.5" />
                    Admin
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                {user.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    {user.email}
                  </span>
                )}
                {user.ward && (
                  <Link
                    href={`/ward/${user.ward}`}
                    className="flex items-center gap-1 font-bold text-primary hover:underline"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    Ward {user.ward}
                  </Link>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-bold text-muted hover:bg-card hover:text-foreground"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit Profile
          </button>
        </div>

        {/* Citizen Karma & Stats Grid */}
        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border/80 pt-6 text-center">
          <div className="rounded-xl bg-primary/10 p-3">
            <div className="flex items-center justify-center gap-1 text-xs font-bold text-primary">
              <Award className="h-4 w-4" />
              <span>Karma Points</span>
            </div>
            <p className="mt-1 text-2xl font-black text-primary">{user.points || 245}</p>
          </div>

          <div className="rounded-xl bg-surface p-3">
            <p className="text-xs font-medium text-muted uppercase">Reports</p>
            <p className="mt-1 text-2xl font-black text-dark">{myPosts.length || 3}</p>
          </div>

          <div className="rounded-xl bg-surface p-3">
            <p className="text-xs font-medium text-muted uppercase">Upvotes</p>
            <p className="mt-1 text-2xl font-black text-dark">{myUpvoted.length || 6}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border text-sm font-bold">
        <button
          onClick={() => setActiveTab("posts")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 transition-colors ${
            activeTab === "posts"
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>{t.myReports} ({myPosts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("upvoted")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 transition-colors ${
            activeTab === "upvoted"
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          <ThumbsUp className="h-4 w-4" />
          <span>{t.myUpvotes} ({myUpvoted.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === "posts" ? (
          myPosts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted">
              You haven&apos;t submitted any civic issue reports yet.
            </div>
          ) : (
            myPosts.map((p) => <PostCard key={p.id} post={p} />)
          )
        ) : myUpvoted.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted">
            You haven&apos;t upvoted any reports yet.
          </div>
        ) : (
          myUpvoted.map((p) => <PostCard key={p.id} post={p} />)
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-dark">Edit Profile</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="rounded-full p-1 text-muted hover:bg-surface"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-muted">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted">Primary Dhaka Ward</label>
                <select
                  value={ward}
                  onChange={(e) => setWard(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                >
                  {Array.from({ length: 92 }, (_, i) => i + 1).map((w) => (
                    <option key={w} value={w}>
                      Ward {w}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-border p-3">
                <input
                  type="checkbox"
                  checked={isVolunteer}
                  onChange={(e) => setIsVolunteer(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-border text-primary"
                />
                <div>
                  <span className="text-xs font-bold text-dark">Community Volunteer</span>
                  <p className="text-[11px] text-muted">
                    Sign up to receive volunteer notifications and help resolve neighborhood issues
                  </p>
                </div>
              </label>

              <div className="mt-6 flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 rounded-xl border border-border py-2 text-xs font-semibold text-foreground hover:bg-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
