/**
 * Everything in this shape is sent to the browser and readable by anyone
 * who opens devtools. Secrets belong in lib/env.ts and must never appear here.
 */
export interface AppConfig {
    apiBaseUrl: string;
    mediaBaseUrl: string;
    currency: string;
    locale: string;
    timezone: string;
    environment: "development" | "test" | "production";
    features: { wishlist: boolean; onlinePayment: boolean };
}
