import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginRequest, fetchCurrentUser } from "../api/auth-api";
import { mapToAuthSession } from "../mappers/auth.mapper";
import { loginRequestSchema } from "../schemas/login.schema";
import { sessionStorageAdapter } from "../lib/session-storage";
import { authKeys } from "../lib/query-keys";
import type { AuthSession, LoginPayload } from "../types/auth";

async function performLogin(payload: LoginPayload): Promise<AuthSession> {
  const parsed = loginRequestSchema.safeParse(payload);

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid login input";

    throw new Error(message);
  }

  const dto = await loginRequest(payload);

  // Role isn't in the login response, so fetch it separately.
  // Falls back to "user" if this call fails, so login still succeeds.
  let rawRole = "user";

  try {
    const me = await fetchCurrentUser(dto.accessToken);
    rawRole = me.role;
  } catch {}

  const AuthSession = mapToAuthSession(dto, rawRole);
  sessionStorageAdapter.save(AuthSession);
  return AuthSession;
}

/**
 * useMutation instead of manual useState/useEffect gives us isPending,
 * isError/error, isSuccess, retry(), and reset() for free. On success we
 * seed the ["auth", "me"] query cache so any component reading the
 * current user via useCurrentUser() updates instantly, with no refetch.
 */
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: authKeys.login(),
    mutationFn: performLogin,
    onSuccess: (session) => {
      queryClient.setQueryData(authKeys.currentUser(), session.user);
    },
  });
}
