"use client";
import { useTranslations } from "next-intl";
import { usePathname } from "@/app/i18n/navigation";
import { routing } from "@/app/i18n/routing";
// looks up the current pathname in Page-Title

export function usePageTitle(): string {
    const pathname = usePathname();
    const t = useTranslations("Navigation");
    const segments = pathname.split("/").filter(Boolean);

    if (routing.locales.some((locale) => locale === segments[0])) {
        segments.shift();
    }

    const routeKey = segments[0] ?? "overview";

    if (routeKey === "settings") {
        const settingsPage = segments[1];
        const settingsKeys: Record<string, string> = {
            profile: "profile",
            appearance: "appearance",
            "privacy-security": "privacySecurity"
        };

        return t(settingsKeys[settingsPage] ?? "settings");
    } else if (routeKey === "catalog") {
        const catalogPage = segments[1];
        const catalogKeys: Record<string, string> = {
            products: "products",
            categories: "categories",
            inventory: "inventory"
        };
        return t(catalogKeys[catalogPage] ?? "catalog");
    }

    return t(routeKey);
}
