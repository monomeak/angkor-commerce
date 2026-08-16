import type { QueryClient } from "@tanstack/react-query";

import { authKeys } from "./query-keys";
import type { CurrentCustomer } from "../types/auth";

/**
 * Drops every cached query and installs the new session's customer — `null` for a logout.
 *
 * Nulling the `/me` key alone is not enough: customer-scoped caches (the wishlist ids behind
 * every heart, the address book) outlive it, so hearts stay filled after a logout and whoever
 * signs in next on this browser inherits them. Login and register call this too — `/login`
 * and `/signup` are reachable while already signed in.
 */
export function resetSessionCache(queryClient: QueryClient, customer: CurrentCustomer | null) {
    queryClient.clear();
    queryClient.setQueryData(authKeys.currentCustomer(), customer);
}
