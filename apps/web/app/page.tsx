import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  CircleDollarSign,
  Clock3,
  FileCheck2,
  FileText,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { AcmeLogo } from "@/components/acme-logo";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: ReceiptText,
    title: "Effortless invoicing",
    description:
      "Create polished invoices in seconds and keep every client detail in one place.",
  },
  {
    icon: BarChart3,
    title: "Clear business insights",
    description:
      "See revenue, outstanding payments, and cash flow without wrestling with spreadsheets.",
  },
  {
    icon: ShieldCheck,
    title: "Built for confidence",
    description:
      "Reliable workflows and organized records help you stay ready for every deadline.",
  },
];

const invoices = [
  { name: "Acme Studios", id: "INV-2048", amount: "$2,840.00", status: "Paid" },
  {
    name: "Northstar Labs",
    id: "INV-2047",
    amount: "$1,260.00",
    status: "Pending",
  },
  { name: "Vertex Works", id: "INV-2046", amount: "$3,120.00", status: "Paid" },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[680px] bg-[radial-gradient(circle_at_70%_10%,color-mix(in_oklch,var(--primary)_9%,transparent),transparent_40%),radial-gradient(circle_at_15%_20%,color-mix(in_oklch,var(--chart-2)_8%,transparent),transparent_35%)]" />

      <header className="relative z-10 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <AcmeLogo href="/" size="lg" />

          <nav
            className="hidden items-center gap-7 text-sm text-muted-foreground md:flex"
            aria-label="Main navigation"
          >
            <Link
              className="transition-colors hover:text-foreground"
              href="#features"
            >
              Features
            </Link>
            <Link
              className="transition-colors hover:text-foreground"
              href="#preview"
            >
              Product
            </Link>
            <Link
              className="transition-colors hover:text-foreground"
              href="#pricing"
            >
              Pricing
            </Link>
          </nav>

          <div className="hidden items-center justify-center gap-2 p-5 sm:flex">
            <Button
              nativeButton={false}
              variant="ghost"
              render={<Link href="/login" />}
            >
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
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:pb-28 lg:pt-24">
        <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1.5 text-xs font-medium shadow-sm">
            <Sparkles className="size-3.5" />
            Simple finances. Stronger business.
          </div>
          <h1 className="text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-6xl sm:leading-[1.05]">
            Run your business, not your spreadsheets.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg lg:mx-0">
            Send invoices, track payments, and understand your cash flow from
            one calm, beautifully organized dashboard.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Button
              className="h-11 px-5 text-sm"
              nativeButton={false}
              size="lg"
              render={<Link href="/login" />}
            >
              Start for free <ArrowRight data-icon="inline-end" />
            </Button>
            <Button
              className="h-11 px-5 text-sm"
              nativeButton={false}
              size="lg"
              variant="outline"
              render={<Link href="#preview" />}
            >
              See how it works
            </Button>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground lg:justify-start">
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5 text-foreground" /> No credit card
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5 text-foreground" /> Setup in 2 minutes
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5 text-foreground" /> Cancel anytime
            </span>
          </div>
        </div>

        <DashboardPreview />
      </section>

      <section className="border-y bg-muted/30">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-5 py-7 text-center sm:px-8 md:flex-row md:text-left">
          <p className="max-w-xs text-sm text-muted-foreground">
            Trusted by focused teams building healthier businesses.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-9 gap-y-3 text-sm font-semibold tracking-tight text-muted-foreground/75 sm:text-base">
            <span>Northstar</span>
            <span>Vertex</span>
            <span>MONOLITH</span>
            <span>Brightline</span>
            <span>Acme</span>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Everything in one place
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            Less admin. More momentum.
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            The essentials you need to stay paid, informed, and in
            control—without the clutter.
          </p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="bg-card/70 transition-transform duration-300 hover:-translate-y-1"
            >
              <CardHeader className="gap-4">
                <span className="flex size-10 items-center justify-center rounded-lg bg-muted ring-1 ring-border">
                  <feature.icon className="size-5" />
                </span>
                <div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription className="mt-2 leading-6">
                    {feature.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section
        id="pricing"
        className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:pb-28"
      >
        <div className="flex flex-col items-center justify-between gap-8 rounded-3xl bg-primary px-6 py-12 text-center text-primary-foreground sm:px-12 lg:flex-row lg:py-14 lg:text-left">
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.03em]">
              Ready for a clearer workday?
            </h2>
            <p className="mt-3 text-sm text-primary-foreground/70 sm:text-base">
              Join growing businesses that spend less time chasing numbers.
            </p>
          </div>
          <Button
            className="h-11 bg-background px-5 text-foreground hover:bg-background/90"
            nativeButton={false}
            size="lg"
            render={<Link href="/login" />}
          >
            Start for free <ArrowRight data-icon="inline-end" />
          </Button>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-7 text-xs text-muted-foreground sm:flex-row sm:px-8">
          <AcmeLogo href="/" size="sm" />
          <p>© 2026 Acme. Built for better business.</p>
        </div>
      </footer>
    </main>
  );
}

function DashboardPreview() {
  return (
    <div
      id="preview"
      className="relative mx-auto w-full max-w-2xl scroll-mt-24"
    >
      <div className="absolute -inset-5 -z-10 rounded-[2rem] bg-muted/60 blur-2xl" />
      <div className="overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-foreground/10">
        <div className="flex h-12 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-foreground/20" />
            <span className="size-2 rounded-full bg-foreground/20" />
            <span className="size-2 rounded-full bg-foreground/20" />
          </div>
          <span className="text-[10px] font-medium text-muted-foreground">
            acme.app/dashboard
          </span>
          <MoreHorizontal className="size-4 text-muted-foreground" />
        </div>
        <div className="grid min-h-[420px] grid-cols-[56px_1fr] sm:grid-cols-[150px_1fr]">
          <aside className="border-r bg-muted/30 p-3">
            <AcmeLogo className="mb-6 hidden px-1 sm:inline-flex" size="sm" />
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center gap-2 rounded-md bg-background px-2 py-2 font-medium shadow-sm">
                <LayoutDashboard className="size-3.5" />
                <span className="hidden sm:inline">Overview</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-2 text-muted-foreground">
                <FileText className="size-3.5" />
                <span className="hidden sm:inline">Invoices</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-2 text-muted-foreground">
                <Users className="size-3.5" />
                <span className="hidden sm:inline">Customers</span>
              </div>
            </div>
          </aside>
          <div className="min-w-0 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground">
                  Tuesday, July 14
                </p>
                <h3 className="mt-1 text-sm font-semibold sm:text-base">
                  Good morning, Alex
                </h3>
              </div>
              <div className="flex size-7 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground">
                AM
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <MiniStat
                icon={CircleDollarSign}
                label="Revenue"
                value="$24,560"
                detail="+12.5%"
              />
              <MiniStat
                icon={Clock3}
                label="Outstanding"
                value="$4,230"
                detail="3 invoices"
              />
              <MiniStat
                className="hidden sm:block"
                icon={FileCheck2}
                label="Paid"
                value="18"
                detail="This month"
              />
            </div>
            <div className="mt-3 rounded-xl border p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground">Revenue</p>
                  <p className="mt-1 text-sm font-semibold">$18,420</p>
                </div>
                <span className="flex items-center gap-1 text-[9px] font-medium">
                  <TrendingUp className="size-3" /> +8.2%
                </span>
              </div>
              <div className="mt-4 flex h-20 items-end gap-1.5 sm:gap-2">
                {[35, 55, 42, 70, 58, 82, 68, 92, 76, 100, 86, 110].map(
                  (height, index) => (
                    <span
                      key={index}
                      className="flex-1 rounded-sm bg-primary/15 last:bg-primary"
                      style={{ height: `${height / 1.25}%` }}
                    />
                  ),
                )}
              </div>
            </div>
            <div className="mt-3 overflow-hidden rounded-xl border">
              <div className="flex items-center justify-between border-b px-3 py-2.5">
                <p className="text-[10px] font-semibold">Recent invoices</p>
                <span className="text-[9px] text-muted-foreground">
                  View all
                </span>
              </div>
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="grid grid-cols-[1fr_auto] items-center gap-2 border-b px-3 py-2 last:border-0 sm:grid-cols-[1fr_70px_75px]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[10px] font-medium">
                      {invoice.name}
                    </p>
                    <p className="text-[8px] text-muted-foreground">
                      {invoice.id}
                    </p>
                  </div>
                  <span className="hidden text-[9px] sm:block">
                    {invoice.amount}
                  </span>
                  <span className="rounded-full bg-muted px-2 py-1 text-center text-[8px] font-medium">
                    {invoice.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  detail,
  className = "",
}: {
  icon: typeof CircleDollarSign;
  label: string;
  value: string;
  detail: string;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border bg-background p-3 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-muted-foreground">{label}</span>
        <Icon className="size-3 text-muted-foreground" />
      </div>
      <p className="mt-2 text-sm font-semibold">{value}</p>
      <p className="mt-0.5 text-[8px] text-muted-foreground">{detail}</p>
    </div>
  );
}
