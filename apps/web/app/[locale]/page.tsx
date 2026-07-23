import {
  BackgroundGlow,
  ClientsSection,
  CtaSection,
  FeaturesSection,
  HeroSection,
  SiteFooter,
  SiteHeader,
  SolutionsSection,
  TrustedTeams,
} from "@/components/home";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <BackgroundGlow />
      <SiteHeader />
      <HeroSection />
      <TrustedTeams />
      <FeaturesSection />
      <CtaSection />
      <SolutionsSection />
      <ClientsSection />
      <SiteFooter />
    </main>
  );
}
