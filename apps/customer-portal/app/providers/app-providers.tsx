import { ReactNode } from "react";
import { ThemeProviderConfig } from "./theme-provider";
import { QueryClientProviderConfig } from "./query-client-providers";
import { CartProviderConfig } from "@/src/features/cart/lib/cart-context";

interface AppProvidersProps {
  readonly children: ReactNode;
}

export function AppProvidersConfig({ children }: AppProvidersProps) {
  return (
    <ThemeProviderConfig>
      <QueryClientProviderConfig>
        <CartProviderConfig>{children}</CartProviderConfig>
      </QueryClientProviderConfig>
    </ThemeProviderConfig>
  );
}
