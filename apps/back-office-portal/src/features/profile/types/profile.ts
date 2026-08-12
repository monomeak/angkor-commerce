import type { AppRole } from "@/src/features/auth/types/auth";

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  username: string;
  image: string;
  gender: "male" | "female";
  birthDate: string;
  role: AppRole;
  company: {
    name: string;
    department: string;
    title: string;
  };
  address: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

// Fields the user is allowed to edit in the form
export type EditableProfileField = Exclude<
  keyof UserProfile,
  "id" | "image" | "role" | "company" | "address"
>;
