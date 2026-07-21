import { useMutation } from "@tanstack/react-query";

import { forgotPasswordRequest } from "../api/auth-api";
import { authKeys } from "../lib/query-keys";
import { forgotPasswordRequestSchema } from "../schemas/forgot-password.schema";
import type { ForgotPasswordPayload } from "../types/auth";

async function performForgotPassword(
  payload: ForgotPasswordPayload,
): Promise<{ email: string }> {
  const parsed = forgotPasswordRequestSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  return forgotPasswordRequest(parsed.data);
}

export function useForgotPassword() {
  return useMutation({
    mutationKey: authKeys.forgotPassword(),
    mutationFn: performForgotPassword,
  });
}
