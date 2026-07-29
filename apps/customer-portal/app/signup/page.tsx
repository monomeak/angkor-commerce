import { AuthShell } from "@/src/features/auth/components/auth-shell";
import { SignupForm } from "@/src/features/auth/components/signup-form";

export default function SignupPage() {
  return (
    <AuthShell>
      <SignupForm />
    </AuthShell>
  );
}
