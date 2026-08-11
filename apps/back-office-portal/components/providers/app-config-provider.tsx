"use client";

import { createContext, useContext } from "react";
import type { AppConfig } from "@/lib/app-config";

const AppConfigContext = createContext<AppConfig | null>(null);

export function AppConfigProvider({ config, children }: { config: AppConfig; children: React.ReactNode }) {
    return <AppConfigContext.Provider value={config}>{children}</AppConfigContext.Provider>;
}

export function useAppConfig(): AppConfig {
    const config = useContext(AppConfigContext);
    if (!config) {
        throw new Error("useAppConfig must be used inside <AppConfigProvider>");
    }
    return config;
}

export function useFeature(flag: keyof AppConfig["features"]): boolean {
    return useAppConfig().features[flag];
}
