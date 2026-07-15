"use client";

import { useRouter } from "next/navigation";

import { LoginForm } from "@/src/features/auth/components/login-form";

export default function LoginPage() {
  const router = useRouter();

  return <LoginForm onSuccess={() => router.replace("/overview")} />;
}
