import { ReactNode } from "react";
import { ThemeProviderConfig } from "./theme-provider";
import { QueryClientProviderConfig } from "./query-client-providers";
import { AppConfig } from "@/lib/app-config";
import { AppConfigProvider } from "./app-config-provider";

interface AppProvidersProps {
    readonly config: AppConfig;
    readonly children: React.ReactNode;
}

export function Providers({ config, children }: AppProvidersProps) {
    return (
        <AppConfigProvider config={config}>
            <ThemeProviderConfig>
                <QueryClientProviderConfig>{children}</QueryClientProviderConfig>
            </ThemeProviderConfig>
        </AppConfigProvider>
    );
}
