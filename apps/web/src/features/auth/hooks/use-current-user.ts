import { useQuery } from "@tanstack/react-query";
import { fetchCurrentUser } from "../api/auth-api";
import { mapCurrentUserToAuthUser } from "../mappers/auth.mapper";
import { sessionStorageAdapter } from "../lib/session-storage";
import { authKeys } from "../lib/query-keys";
import type { AuthUser } from "../types/auth";

export function useCurrentUser() {
  const stored = sessionStorageAdapter.load();

  return useQuery<AuthUser>({
    queryKey: authKeys.currentUser(),
    queryFn: async () => {
      if (!stored) throw new Error("No active session");
      const dto = await fetchCurrentUser(stored.accessToken);
      return mapCurrentUserToAuthUser(dto);
    },
    initialData: stored?.user,
    enabled: !!stored,
    staleTime: 5 * 60 * 1000, // 5 min — avoid refetching on every mount
    retry: false,
  });
}
