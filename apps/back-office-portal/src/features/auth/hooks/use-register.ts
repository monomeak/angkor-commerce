import { useMutation } from "@tanstack/react-query";

import { useAppConfig } from "@/components/providers/app-config-provider";
import { registerRequest } from "../api/auth-api";
import { authKeys } from "../lib/query-keys";
import { registerRequestSchema } from "../schemas/register.schema";
import type { RegisterPayload } from "../types/auth";
import type { DummyRegisterResponse } from "../types/dummy-auth";

async function performRegister(
  apiBaseUrl: string,
  payload: RegisterPayload,
): Promise<DummyRegisterResponse> {
  const parsed = registerRequestSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  return registerRequest(apiBaseUrl, parsed.data);
}

export function useRegister() {
  const { apiBaseUrl } = useAppConfig();

  return useMutation({
    mutationKey: authKeys.register(),
    mutationFn: (payload: RegisterPayload) =>
      performRegister(apiBaseUrl, payload),
  });
}
