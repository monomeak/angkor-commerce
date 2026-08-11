import type { ReactNode } from "react";

import { AddressProviderConfig } from "@/src/features/account/lib/address-context";
import { CartProviderConfig } from "@/src/features/cart/lib/cart-context";
import type { AppConfig } from "@/lib/app-config";
import { AppConfigProvider } from "./app-config-provider";
import { QueryClientProviderConfig } from "./query-client-providers";
import { ThemeProviderConfig } from "./theme-provider";

interface AppProvidersProps {
  readonly config: AppConfig;
  readonly children: ReactNode;
}

export function Providers({ config, children }: AppProvidersProps) {
  return (
    <AppConfigProvider config={config}>
      <ThemeProviderConfig>
        <QueryClientProviderConfig>
          <AddressProviderConfig>
            <CartProviderConfig>{children}</CartProviderConfig>
          </AddressProviderConfig>
        </QueryClientProviderConfig>
      </ThemeProviderConfig>
    </AppConfigProvider>
  );
}
