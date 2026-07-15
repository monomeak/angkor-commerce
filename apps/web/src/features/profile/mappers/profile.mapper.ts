import type { ValidatedProfile } from "../schemas/profile.schema";
import type { UserProfile } from "../types/profile";

export function mapProfileResponse(profile: ValidatedProfile): UserProfile {
  return {
    id: profile.id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    phone: profile.phone,
    username: profile.username,
    image: profile.image,
    gender: profile.gender,
    birthDate: profile.birthDate,
    role: profile.role,
    company: {
      name: profile.company.name,
      department: profile.company.department,
      title: profile.company.title,
    },
    address: {
      address: profile.address.address,
      city: profile.address.city,
      state: profile.address.state,
      postalCode: profile.address.postalCode,
      country: profile.address.country,
    },
  };
}
