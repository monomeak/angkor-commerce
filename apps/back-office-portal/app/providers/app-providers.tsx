import { ReactNode } from "react";
import { ThemeProviderConfig } from "./theme-provider";
import { QueryClientProviderConfig } from "./query-client-providers";

interface AppProvidersProps {
  readonly children: ReactNode;
}

export function AppProvidersConfig({ children }: AppProvidersProps) {
  return (
    <ThemeProviderConfig>
      <QueryClientProviderConfig>{children}</QueryClientProviderConfig>
    </ThemeProviderConfig>
  );
}
