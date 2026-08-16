import { useMutation } from "@tanstack/react-query";

import { useAppConfig } from "@/components/providers/app-config-provider";
import { registerRequest } from "../api/auth-api";
import { authKeys } from "../lib/query-keys";
import { registerRequestSchema } from "../schemas/register.schema";
import type { RegisterPayload } from "../types/auth";

async function performRegister(
  apiBaseUrl: string,
  payload: RegisterPayload,
): Promise<never> {
  const parsed = registerRequestSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  return registerRequest();
}

export function useRegister() {
  const { apiBaseUrl } = useAppConfig();

  return useMutation({
    mutationKey: authKeys.register(),
    mutationFn: (payload: RegisterPayload) =>
      performRegister(apiBaseUrl, payload),
  });
}
