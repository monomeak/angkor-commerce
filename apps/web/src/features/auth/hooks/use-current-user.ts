import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { fetchCurrentUser } from "../api/auth-api";
import { mapCurrentUserToAuthUser } from "../mappers/auth.mapper";
import { sessionStorageAdapter } from "../lib/session-storage";
import { authKeys } from "../lib/query-keys";
import type { AuthSession, AuthUser } from "../types/auth";

export function useCurrentUser() {
  const queryClient = useQueryClient();
  const [stored, setStored] = useState<AuthSession | null>(null);

  useEffect(() => {
    const session = sessionStorageAdapter.load();

    // Restoring a browser-only session necessarily happens after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStored(session);

    if (session) {
      queryClient.setQueryData(authKeys.currentUser(), session.user);
    }
  }, [queryClient]);

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
