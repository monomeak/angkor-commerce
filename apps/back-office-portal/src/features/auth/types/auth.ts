export type ApiRole = "admin" | "user" | "moderator";
export type AppRole = "super_admin" | "shop_admin" | "staff";

export interface AuthUser {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    // gender: "male" | "female";
    image: string;
    role: AppRole;
}
export interface AuthSession {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
}

export interface LoginPayload {
    username: string;
    password: string;
    // rememberMe?: boolean;
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
export interface ResetPasswordPayload {
    token: string;
    password: string;
    confirmPassword: string;
}
