import { z } from "zod";

import { isExpiryInFuture, isValidCardNumber } from "../lib/card-format";

const expirySchema = z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Enter expiry as MM/YY.");

function refineExpiryInFuture<T extends { expiry: string }>(data: T): boolean {
  const [month, year] = data.expiry.split("/");
  return isExpiryInFuture(month, year);
}

export const addCardSchema = z
  .object({
    cardholderName: z.string().min(1, "Cardholder name is required."),
    cardNumber: z
      .string()
      .transform((value) => value.replace(/\s+/g, ""))
      .pipe(z.string().regex(/^\d{13,19}$/, "Enter a valid card number.")),
    expiry: expirySchema,
    cvc: z.string().regex(/^\d{3,4}$/, "Enter a valid CVC."),
  })
  .refine((data) => isValidCardNumber(data.cardNumber), {
    message: "Enter a valid card number.",
    path: ["cardNumber"],
  })
  .refine(refineExpiryInFuture, {
    message: "Card has expired.",
    path: ["expiry"],
  });

export const editCardSchema = z
  .object({
    cardholderName: z.string().min(1, "Cardholder name is required."),
    expiry: expirySchema,
  })
  .refine(refineExpiryInFuture, {
    message: "Card has expired.",
    path: ["expiry"],
  });
