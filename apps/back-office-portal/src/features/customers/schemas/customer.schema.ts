import { z } from "zod";

const coordinatesSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

const addressSchema = z.object({
  address: z.string(),
  city: z.string(),
  state: z.string(),
  stateCode: z.string(),
  postalCode: z.string(),
  coordinates: coordinatesSchema,
  country: z.string(),
});

const companySchema = z.object({
  department: z.string(),
  name: z.string(),
  title: z.string(),
  address: addressSchema,
});

export const userSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  image: z.string(),
  company: companySchema,
  address: addressSchema,
});

export const usersResponseSchema = z.object({
  users: z.array(userSchema),
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
});

export type ValidatedUser = z.infer<typeof userSchema>;
export type ValidatedUsersResponse = z.infer<typeof usersResponseSchema>;
