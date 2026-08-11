import { AuthView } from "@/src/features/auth/views/auth-view";

type LoginPageProps = {
  readonly searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;

  return <AuthView mode="login" next={next} />;
}
