import { z } from "zod";

export const shippingAddressSchema = z.object({
  fullName: z.string().min(1, "Full name is required."),
  phone: z.string().min(1, "Phone number is required."),
  address: z.string().min(1, "Address is required."),
  city: z.string().min(1, "City is required."),
  postalCode: z.string().optional(),
  notes: z.string().optional(),
});
