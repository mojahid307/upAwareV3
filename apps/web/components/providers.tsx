"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { EmergencyProvider } from "@/hooks/useEmergency";
import { LanguageProvider } from "@/lib/i18n";

/**
 * Client-side providers shared across the whole app:
 *  - TanStack Query for server state + caching
 *  - AuthProvider for the logged-in user + token storage
 *  - EmergencyProvider for SOS alerts + banner state
 *  - LanguageProvider for English / Bengali i18n
 */
export function Providers({ children }: { children: ReactNode }) {
  // One QueryClient per browser session (created once via useState initializer).
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <EmergencyProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </EmergencyProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

