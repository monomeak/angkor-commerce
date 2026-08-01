import { currentCustomer } from "../data/account.data";
import type { AccountCustomer } from "../types/account";

// Shaped like a future HTTP call to apps/core-api once auth exists.
export async function fetchCurrentCustomer(): Promise<AccountCustomer> {
  return currentCustomer;
}
