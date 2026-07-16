"use client";

import { useRouter } from "next/navigation";

import { RegisterForm } from "@/src/features/auth/components/register-form";

export default function RegisterPage() {
  const router = useRouter();
  //  use tradtional style register then perform login.
  return <RegisterForm onSuccess={() => router.replace("/login")} />;
}
