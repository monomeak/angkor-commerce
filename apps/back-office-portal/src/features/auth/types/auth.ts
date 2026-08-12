/**
 * core-api's Role enum serialises lowercase (super_admin | shop_admin | staff), which is
 * already the app's own vocabulary — so unlike the DummyJSON era there is no second role
 * namespace to translate between.
 */
export type AppRole = "super_admin" | "shop_admin" | "staff";

export type AccountStatus = "active" | "inactive" | "deleted";

export interface AuthUser {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    /** Raw MinIO object key — run it through resolveMediaUrl() before rendering. */
    image: string | null;
    role: AppRole;
}

/** /auth/me adds the fields the login response omits. */
export interface CurrentUser extends AuthUser {
    phone: string | null;
    status: AccountStatus;
}

export interface LoginPayload {
    username: string;
    password: string;
}

export interface UpdateProfilePayload {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    image?: string;
}

export interface RegisterPayload {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
}

export interface ForgotPasswordPayload {
    email: string;
}
