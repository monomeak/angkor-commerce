import { redirect } from "@/app/i18n/navigation";

type HomeProps = {
    readonly params: Promise<{ locale: string }>;
};

export default async function Home({ params }: HomeProps) {
    const { locale } = await params;

    redirect({ href: "/login", locale });
}
