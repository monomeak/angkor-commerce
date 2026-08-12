import { z } from "zod";

export const appRoleSchema = z.enum(["super_admin", "shop_admin", "staff"]);
export const accountStatusSchema = z.enum(["active", "inactive", "deleted"]);

/** POST /auth/login and POST /auth/refresh → AuthenticatedUserResponse. */
export const authenticatedUserSchema = z.object({
    id: z.number(),
    username: z.string(),
    email: z.string(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    image: z.string().nullable(),
    role: appRoleSchema
});

/** GET /auth/me → CurrentUserResponse. */
export const currentUserSchema = authenticatedUserSchema.extend({
    phone: z.string().nullable(),
    status: accountStatusSchema
});

export type AuthenticatedUserDto = z.infer<typeof authenticatedUserSchema>;
export type CurrentUserDto = z.infer<typeof currentUserSchema>;
