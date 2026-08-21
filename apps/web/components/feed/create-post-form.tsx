"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Sparkles,
  UserCheck,
  AlertTriangle,
  Send,
  Image as ImageIcon,
  CheckCircle2,
  X,
} from "lucide-react";
import { Category, Severity } from "@/types";
import { CATEGORY_META } from "@/lib/domain";
import { createPost } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { LocationPickerModal } from "@/components/map/location-picker-modal";

import { useQueryClient } from "@tanstack/react-query";

export function CreatePostForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<Category>(Category.INFRASTRUCTURE);
  const [severity, setSeverity] = useState<Severity>(Severity.NORMAL);
  const [lat, setLat] = useState<number>(23.8103);
  const [lng, setLng] = useState<number>(90.4125);
  const [address, setAddress] = useState("");
  const [ward, setWard] = useState<number>(4);
  const [isAnon, setIsAnon] = useState(false);
  const [aiAllowed, setAiAllowed] = useState(true);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError(language === "bn" ? "দয়া করে শিরোনাম ও বিস্তারিত বিবরণ লিখুন" : "Please provide both title and description");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const created = await createPost({
        title: title.trim(),
        body: body.trim(),
        category,
        severity,
        lat,
        lng,
        address: address.trim() || undefined,
        ward: ward || undefined,
        isAnon,
        aiAllowed,
        mediaUrls: mediaPreview ? [mediaPreview] : [],
      });

      queryClient.invalidateQueries({ queryKey: ["posts"] });
      router.push(`/post/${created.id}`);
    } catch (err: any) {
      console.error("[createPost]", err);
      setError(err?.response?.data?.error || err.message || "Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-dark sm:text-3xl">
          {t.createPostTitle}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {t.createPostSubtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-sm">
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-emergency/30 bg-emergency/10 p-3.5 text-sm text-emergency">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted">
            {t.postTitleLabel} <span className="text-emergency">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.postTitlePlaceholder}
            className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-all placeholder:text-muted focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Category selector pills */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted">
            {t.postCategoryLabel} <span className="text-emergency">*</span>
          </label>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {Object.values(Category).map((cat) => {
              const meta = CATEGORY_META[cat];
              const isSelected = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs font-bold transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20"
                      : "border-border bg-surface text-foreground hover:bg-card"
                  }`}
                >
                  <span className="text-base">{meta.emoji}</span>
                  <span className="truncate">{meta.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Severity Toggle */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted">
            {t.postSeverityLabel}
          </label>
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setSeverity(Severity.NORMAL)}
              className={`flex-1 rounded-xl border p-3 text-center text-xs font-bold transition-all ${
                severity === Severity.NORMAL
                  ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20"
                  : "border-border bg-surface text-muted hover:bg-card"
              }`}
            >
              🟢 {t.severity_normal}
            </button>
            <button
              type="button"
              onClick={() => setSeverity(Severity.EMERGENCY)}
              className={`flex-1 rounded-xl border p-3 text-center text-xs font-bold transition-all ${
                severity === Severity.EMERGENCY
                  ? "border-emergency bg-emergency/15 text-emergency ring-2 ring-emergency/20"
                  : "border-border bg-surface text-muted hover:bg-card"
              }`}
            >
              🚨 {t.severity_emergency}
            </button>
          </div>
        </div>

        {/* Description Body */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted">
            {t.postBodyLabel} <span className="text-emergency">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t.postBodyPlaceholder}
            className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground transition-all placeholder:text-muted focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Location & Map Picker */}
        <div className="rounded-xl border border-border/80 bg-surface/60 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted">
                {t.postLocationLabel}
              </span>
              <p className="font-mono text-xs text-dark mt-0.5">
                📍 {lat.toFixed(4)}, {lng.toFixed(4)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsMapPickerOpen(true)}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3.5 py-2 text-xs font-bold text-primary transition-all hover:bg-primary/20"
            >
              <MapPin className="h-3.5 w-3.5" />
              {t.pickOnMap}
            </button>
          </div>

          {/* Address & Ward inputs */}
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t.addressPlaceholder}
                className="w-full rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <select
                value={ward}
                onChange={(e) => setWard(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
              >
                {Array.from({ length: 92 }, (_, i) => i + 1).map((w) => (
                  <option key={w} value={w}>
                    Ward {w}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Image Attachment */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
            Attach Photo (Optional)
          </label>
          <div className="flex items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-surface px-4 py-2.5 text-xs font-medium text-muted transition-colors hover:border-primary hover:text-primary">
              <ImageIcon className="h-4 w-4" />
              <span>Choose Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            {mediaPreview && (
              <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mediaPreview}
                  alt="Attachment preview"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setMediaPreview(null)}
                  className="absolute right-0.5 top-0.5 rounded-full bg-dark/80 p-0.5 text-white hover:bg-dark"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Toggles (Anonymous + AI suggestions) */}
        <div className="space-y-3 border-t border-border pt-4">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/80 bg-surface/50 p-3 hover:bg-surface">
            <input
              type="checkbox"
              checked={isAnon}
              onChange={(e) => setIsAnon(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <div>
              <span className="text-xs font-bold text-dark">{t.postAnonLabel}</span>
              <p className="text-[11px] text-muted">{t.postAnonDesc}</p>
            </div>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 hover:bg-emerald-500/10">
            <input
              type="checkbox"
              checked={aiAllowed}
              onChange={(e) => setAiAllowed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-emerald-500 text-emerald-600 focus:ring-emerald-500"
            />
            <div>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span>{t.allowAiLabel}</span>
              </div>
              <p className="text-[11px] text-muted">{t.allowAiDesc}</p>
            </div>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>{t.submitting}</span>
            </div>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>{t.submitPost}</span>
            </>
          )}
        </button>
      </form>

      {/* Map Location Picker Modal */}
      <LocationPickerModal
        isOpen={isMapPickerOpen}
        initialLat={lat}
        initialLng={lng}
        onClose={() => setIsMapPickerOpen(false)}
        onSelect={(newLat, newLng) => {
          setLat(newLat);
          setLng(newLng);
        }}
      />
    </div>
  );
}
