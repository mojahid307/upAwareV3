"use client";

import { useState } from "react";
import { Sparkles, AlertCircle, RefreshCw, X, CheckCircle2 } from "lucide-react";
import { getAISuggestions } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { SuggestionCard } from "./suggestion-card";

interface AISuggestSectionProps {
  postId: string;
  aiAllowed: boolean;
}

export function AISuggestSection({ postId, aiAllowed }: AISuggestSectionProps) {
  const { t } = useLanguage();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!aiAllowed) {
    return null;
  }

  const handleFetchSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    setIsOpenModal(false);

    try {
      const data = await getAISuggestions(postId);
      setSuggestions(data);
    } catch (err: any) {
      console.error("[getAISuggestions]", err);
      setError(err?.response?.data?.error || err.message || "Failed to generate suggestions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-800 dark:text-emerald-300">
              <Sparkles className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-dark">{t.aiHelpTitle}</h3>
          </div>
          <p className="mt-1 text-xs text-muted">
            {t.aiHelpDesc}
          </p>
        </div>

        {!suggestions && (
          <button
            onClick={() => setIsOpenModal(true)}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow transition-all hover:bg-emerald-700 disabled:opacity-50"
          >
            {isLoading ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            <span>{t.getAiSuggestions}</span>
          </button>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emergency/30 bg-emergency/10 p-3 text-xs text-emergency">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="mt-4 flex flex-col items-center justify-center gap-2 py-6 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-emerald-500/30 border-t-emerald-600" />
          <p className="text-xs font-medium text-muted">
            Analyzing Dhaka municipal routing and generating civic escalation plan...
          </p>
        </div>
      )}

      {/* Rendered Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div className="mt-5 space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {suggestions.map((item, idx) => (
              <SuggestionCard key={idx} index={idx} text={item} />
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] text-muted">{t.aiDisclaimer}</p>
            <button
              onClick={handleFetchSuggestions}
              disabled={isLoading}
              className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:underline dark:text-emerald-300"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
              Regenerate
            </button>
          </div>
        </div>
      )}

      {/* Opt-in Confirmation Modal */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                <Sparkles className="h-5 w-5" />
              </div>
              <button
                onClick={() => setIsOpenModal(false)}
                className="rounded-full p-1 text-muted hover:bg-surface hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h4 className="mt-4 text-base font-bold text-dark">{t.aiModalTitle}</h4>
            <p className="mt-1.5 text-xs text-muted leading-relaxed">{t.aiModalDesc}</p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setIsOpenModal(false)}
                className="flex-1 rounded-xl border border-border py-2.5 text-xs font-semibold text-foreground hover:bg-surface"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleFetchSuggestions}
                className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700"
              >
                {t.confirmAi}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
