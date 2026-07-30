"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { LoadingScreen } from "@/components/premium-ui";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [loading, setLoading] = useState(true);

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}
