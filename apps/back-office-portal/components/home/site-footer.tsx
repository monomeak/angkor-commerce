import { AngkorLogo } from "@/components/angkor-logo";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-7 text-xs text-muted-foreground sm:flex-row sm:px-8">
        <AngkorLogo href="/" size="sm" />
        <p>© 2026 Angkor Commerce. Built for better business.</p>
      </div>
    </footer>
  );
}
