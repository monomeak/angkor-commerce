import { env } from "@/config/env";
import { cartsResponseSchema } from "../schemas/cart.schema";
import { mapCartToInvoice } from "../mappers/invoice.mapper";
import type { Invoice } from "../types/invoice";

const BASE_URL = env.apiBaseUrl;

export async function fetchAllInvoices(): Promise<Invoice[]> {
  const res = await fetch(`${BASE_URL}/carts?limit=0`);
  if (!res.ok) {
    throw new Error(`Failed to fetch invoices: ${res.status}`);
  }

  const json = await res.json();
  const parsed = cartsResponseSchema.safeParse(json);
  if (!parsed.success) {
    console.error(parsed.error.message);
    throw new Error("Invalid invoices response shape");
  }

  return parsed.data.carts.map(mapCartToInvoice);
}
