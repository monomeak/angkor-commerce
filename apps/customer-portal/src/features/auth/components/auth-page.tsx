import { AuthShell } from "@/src/features/auth/components/auth-shell";
import { LoginForm } from "@/src/features/auth/components/login-form";
import { SignupForm } from "@/src/features/auth/components/signup-form";

export type AuthMode = "login" | "signup";

const AUTH_CONFIG: Record<AuthMode, { imageSrc: string; imageAlt: string }> = {
  login: { imageSrc: "/login-gate.png", imageAlt: "Angkor Commerce login" },
  signup: { imageSrc: "/registere-gate.png", imageAlt: "Angkor Commerce sign up" },
};

type AuthPageProps = {
  readonly mode: AuthMode;
};

export function AuthPage({ mode }: AuthPageProps) {
  const { imageSrc, imageAlt } = AUTH_CONFIG[mode];

  return (
    <AuthShell imageSrc={imageSrc} imageAlt={imageAlt}>
      {mode === "login" ? <LoginForm /> : <SignupForm />}
    </AuthShell>
  );
}
