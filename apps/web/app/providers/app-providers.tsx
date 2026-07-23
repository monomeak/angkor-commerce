import { ReactNode } from "react";
import { ThemeProviderConfig } from "./theme-privder";
import { LocaleProviderConfig } from "./locale-provider";
import { QueryClientProviderConfig } from "./query-client-providers";

interface AppProvidersProps {
  readonly children: ReactNode;
}

export function AppProvidersConfig({ children }: AppProvidersProps) {
  return (
    <ThemeProviderConfig
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <LocaleProviderConfig>
        <QueryClientProviderConfig>{children}</QueryClientProviderConfig>
      </LocaleProviderConfig>
    </ThemeProviderConfig>
  );
}
