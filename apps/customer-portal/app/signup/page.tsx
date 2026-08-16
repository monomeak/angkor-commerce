import { AuthView } from "@/src/features/auth/views/auth-view";

type SignupPageProps = {
  readonly searchParams: Promise<{ next?: string }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const { next } = await searchParams;

  return <AuthView mode="signup" next={next} />;
}
