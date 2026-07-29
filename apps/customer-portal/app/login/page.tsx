import { AuthShell } from "@/src/features/auth/components/auth-shell";
import { LoginForm } from "@/src/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <AuthShell>
      <LoginForm />
    </AuthShell>
  );
}
