import { env } from "./env";
import type { AppConfig } from "./app-config";

export function getAppConfig(): AppConfig {
    return {
        apiBaseUrl: env.API_BASE_URL,
        currency: "KHR",
        locale: "en-KH",
        timezone: "Asia/Phnom_Penh",
        environment: env.NODE_ENV,
        features: {
            wishlist: true,
            onlinePayment: true
        }
    };
}
