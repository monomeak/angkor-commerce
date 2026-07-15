import { sessionStorageAdapter } from "../lib/session-storage";

import { useQueryClient } from "@tanstack/react-query";
import { authKeys } from "../lib/query-keys";

export function useAuthSession() {
  const queryClient = useQueryClient();

  const logout = () => {
    sessionStorageAdapter.clear();
    queryClient.removeQueries({ queryKey: authKeys.all });
  };

  return { logout };
}
