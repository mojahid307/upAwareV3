"use client";

import { useState } from "react";
import { Check, Copy, Sparkles, Building2 } from "lucide-react";

interface SuggestionCardProps {
  index: number;
  text: string;
}

export function SuggestionCard({ index, text }: SuggestionCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-card to-card p-4 transition-all hover:border-emerald-500/40 hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            {index + 1}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            Action Step {index + 1}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="rounded-lg p-1 text-muted transition-colors hover:bg-surface hover:text-foreground"
          title="Copy suggestion"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <Copy className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
          )}
        </button>
      </div>

      <p className="mt-2.5 text-xs leading-relaxed text-foreground sm:text-sm">
        {text}
      </p>
    </div>
  );
}
