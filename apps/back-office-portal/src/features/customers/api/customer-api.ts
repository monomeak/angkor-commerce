import { usersResponseSchema } from "../schemas/customer.schema";
import { mapUserToCustomer } from "../mappers/customer.mapper";
import type {
  CustomerListFilters,
  CustomerListResult,
} from "../types/customer";
import type { DummyUser } from "../types/dummy-customer";

// Base URL comes from <AppConfigProvider> via the calling hook — see auth-api.ts.

export async function fetchCustomers(
  apiBaseUrl: string,
  { search, page, pageSize }: CustomerListFilters,
): Promise<CustomerListResult> {
  const skip = (page - 1) * pageSize;
  const query = search.trim();
  const url =
    query.length > 0
      ? `${apiBaseUrl}/users/search?q=${encodeURIComponent(query)}&limit=${pageSize}&skip=${skip}`
      : `${apiBaseUrl}/users?limit=${pageSize}&skip=${skip}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch customers: ${res.status}`);
  }
  const json = await res.json();
  const parsed = usersResponseSchema.safeParse(json);
  if (!parsed.success) {
    console.error(parsed.error.flatten());
    throw new Error("Invalid customers response shape");
  }
  return {
    customers: parsed.data.users.map(mapUserToCustomer),
    total: parsed.data.total,
  };
}
export async function fetchCustomerById(apiBaseUrl: string, id: number) {
  const res = await fetch(`${apiBaseUrl}/users/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch customer ${id}: ${res.status}`);
  }
  const json: DummyUser = await res.json();
  return mapUserToCustomer(json);
}
