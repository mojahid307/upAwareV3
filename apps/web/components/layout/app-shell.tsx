"use client";

import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { EmergencyBanner } from "@/components/emergency/emergency-banner";
import { useSocket } from "@/hooks/useSocket";
import { useEmergency } from "@/hooks/useEmergency";
import { useAuth } from "@/hooks/useAuth";

/**
 * Standard authenticated shell: top Navbar, desktop Sidebar, mobile BottomNav.
 * Auth pages render without the shell (they manage their own layout).
 * EmergencyBanner renders above everything when an alert is active.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { handleEmergencyAlert } = useEmergency();

  // Connect to Socket.io and subscribe to the user's ward.
  useSocket(user?.ward ?? undefined, handleEmergencyAlert);

  return (
    <div className="flex min-h-screen flex-col">
      <EmergencyBanner />
      <Navbar />
      <div className="mx-auto flex w-full max-w-6xl flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1 px-4 pb-24 pt-4 md:pb-8">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}

