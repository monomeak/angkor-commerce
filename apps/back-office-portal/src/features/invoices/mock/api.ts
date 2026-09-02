import { cartsResponseSchema } from "./cart.schema";
import { mapCartToInvoice } from "./mapper";
import type { Invoice } from "./types";

// Base URL comes from <AppConfigProvider> via the calling hook — see auth-api.ts.

export async function fetchAllInvoices(apiBaseUrl: string): Promise<Invoice[]> {
  const res = await fetch(`${apiBaseUrl}/carts?limit=0`);
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
