// Mirrors apps/back-office-portal/lib/env.ts — server-side env, handed to the
// browser only through the AppConfig shape so nothing is inlined at build time.
import { z } from "zod";

const schema = z.object({
    /** core-api root, including the version prefix — e.g. http://localhost:8080/api/v1 */
    API_BASE_URL: z.url(),
    /**
     * Public MinIO bucket root. core-api's storefront /me returns the raw object key
     * (unlike the staff UserMapper, which resolves it), so the portal builds the URL.
     */
    MEDIA_BASE_URL: z.url(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development")
});
export const env = schema.parse(process.env);
