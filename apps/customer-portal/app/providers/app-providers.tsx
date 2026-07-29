import { ReactNode } from "react";
import { ThemeProviderConfig } from "./theme-provider";
import { QueryClientProviderConfig } from "./query-client-providers";
import { AccountProviderConfig } from "@/src/features/account/lib/account-context";
import { CartProviderConfig } from "@/src/features/cart/lib/cart-context";

interface AppProvidersProps {
  readonly children: ReactNode;
}

export function AppProvidersConfig({ children }: AppProvidersProps) {
  return (
    <ThemeProviderConfig>
      <QueryClientProviderConfig>
        <AccountProviderConfig>
          <CartProviderConfig>{children}</CartProviderConfig>
        </AccountProviderConfig>
      </QueryClientProviderConfig>
    </ThemeProviderConfig>
  );
}
