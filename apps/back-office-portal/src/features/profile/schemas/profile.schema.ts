import { z } from "zod";

export const profileSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  phone: z.string(),
  username: z.string(),
  image: z.url(),
  gender: z.enum(["male", "female"]),
  birthDate: z.string(),
  role: z.enum(["super_admin", "shop_admin", "staff"]),
  company: z.object({
    name: z.string(),
    department: z.string(),
    title: z.string(),
  }),
  address: z.object({
    address: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }),
});

// This also doubles as our validated DummyUserResponse type
export type ValidatedProfile = z.infer<typeof profileSchema>;
