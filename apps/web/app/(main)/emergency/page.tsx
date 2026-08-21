"use client";

import Link from "next/link";
import { Phone, ArrowLeft } from "lucide-react";
import { SOSButton } from "@/components/emergency/sos-button";
import { ActiveAlerts } from "@/components/emergency/active-alerts";
import { useLanguage } from "@/lib/i18n";

export default function EmergencyPage() {
  const { t, language } = useLanguage();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-dark sm:text-2xl">
          {t.sosTitle}
        </h1>
        <p className="mt-0.5 text-sm text-muted">
          {t.sosSubtitle}
        </p>
      </div>

      {/* SOS Button Section */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <SOSButton />
      </div>

      {/* Quick Call */}
      <a
        href="tel:999"
        className="flex items-center justify-center gap-2 rounded-xl border border-emergency/30 bg-emergency/10 p-4 text-sm font-bold text-emergency transition-colors hover:bg-emergency/20 shadow-sm"
      >
        <Phone className="h-4 w-4" />
        {t.call999}
      </a>

      {/* Active Alerts */}
      <ActiveAlerts />
    </div>
  );
}
