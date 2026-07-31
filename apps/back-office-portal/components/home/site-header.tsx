import Link from "next/link";
import { ArrowRight, Menu } from "lucide-react";

import { AngkorLogo } from "@/components/angkor-logo";
import { Button } from "@/components/ui/button";
import { navItems } from "@/components/home/data";

export function SiteHeader() {
  return (
    <header className="relative z-10 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <AngkorLogo href="/" size="lg" />
        <SiteNav />
        <HeaderActions />
      </div>
    </header>
  );
}

export function SiteNav() {
  return (
    <nav
      className="hidden items-center gap-7 text-sm text-muted-foreground md:flex"
      aria-label="Main navigation"
    >
      {navItems.map((item) => (
        <Link
          key={item.href}
          className="transition-colors hover:text-foreground"
          href={item.href}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function HeaderActions() {
  return (
    <>
      <div className="hidden items-center justify-center gap-2 p-5 sm:flex">
        <Button nativeButton={false} variant="ghost" render={<Link href="/login" />}>
          Sign in
        </Button>
        <Button
          className="h-11 px-5 text-sm"
          nativeButton={false}
          size="lg"
          render={<Link href="/login" />}
        >
          Start for free <ArrowRight data-icon="inline-end" />
        </Button>
      </div>
      <Button
        className="sm:hidden"
        variant="ghost"
        size="icon"
        aria-label="Open menu"
      >
        <Menu />
      </Button>
    </>
  );
}
