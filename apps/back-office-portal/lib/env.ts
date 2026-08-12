import { z } from "zod";

const schema = z.object({
    /** core-api root, including the version prefix — e.g. http://localhost:8080/api/v1 */
    API_BASE_URL: z.url(),
    /**
     * Public MinIO bucket root. Product thumbnails and images come back as raw object
     * keys (e.g. products/1/thumbnail/uuid.jpg), so the portal builds the URL itself.
     */
    MEDIA_BASE_URL: z.url(),
    /**
     * Optional: only the /api/insights/analyze route needs it, and that route
     * answers with a 500 when it's absent. Requiring it here would stop the
     * whole app from booting just because the AI feature isn't configured.
     */
    AI_API_KEY: z.string().min(1).optional(),
    AI_MODEL: z.string().min(1).default("gemini-3.5-flash"),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development")
});

export const env = schema.parse(process.env);
