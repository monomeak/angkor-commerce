"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { useAppConfig } from "./app-config-provider";

export function QueryClientProviderConfig({
  children,
}: {
  children: React.ReactNode;
}) {
  const { environment } = useAppConfig();
  const isDev = environment === "development";
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {isDev && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-right"
          position="bottom"
        ></ReactQueryDevtools>
      )}
    </QueryClientProvider>
  );
}
