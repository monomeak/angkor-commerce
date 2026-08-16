import type { AuthenticatedUserDto, CurrentUserDto } from "../schemas/user.schema";
import type { AuthUser, CurrentUser } from "../types/auth";

/**
 * core-api leaves firstName/lastName null on accounts created before the profile
 * fields existed, but the UI treats them as strings everywhere (initials, greetings,
 * table cells). Normalising to "" here keeps every consumer free of null checks.
 */
export function mapToAuthUser(dto: AuthenticatedUserDto): AuthUser {
    return {
        id: dto.id,
        username: dto.username,
        email: dto.email,
        firstName: dto.firstName ?? "",
        lastName: dto.lastName ?? "",
        image: dto.image,
        role: dto.role
    };
}

export function mapToCurrentUser(dto: CurrentUserDto): CurrentUser {
    return {
        ...mapToAuthUser(dto),
        phone: dto.phone,
        status: dto.status
    };
}
