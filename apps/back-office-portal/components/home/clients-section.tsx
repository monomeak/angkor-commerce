import Link from "next/link";
import { ArrowRight, Building2, Quote } from "lucide-react";

import { clients, type Client } from "@/components/home/data";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/src/shared/lib/get-initial";

export function ClientsSection() {
  return (
    <section
      id="clients"
      className="border-y bg-muted/30 py-16 scroll-mt-24 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-muted-foreground">
              Client teams
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
              Used by teams that need invoices to stay moving.
            </h2>
          </div>
          <Button
            className="h-11 w-fit px-5 text-sm"
            nativeButton={false}
            variant="outline"
            render={<Link href="#pricing" />}
          >
            View pricing <ArrowRight data-icon="inline-end" />
          </Button>
        </div>
        <ClientMarquee />
      </div>
    </section>
  );
}

function ClientMarquee() {
  return (
    <div className="group relative mt-10 overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-muted/30 to-transparent sm:w-24" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-muted/30 to-transparent sm:w-24" />
      <div className="flex w-max gap-4 [animation:client-marquee_34s_linear_infinite] group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] motion-reduce:animate-none">
        {[...clients, ...clients].map((client, index) => (
          <ClientCard
            key={`${client.name}-${index}`}
            client={client}
            isDuplicate={index >= clients.length}
          />
        ))}
      </div>
    </div>
  );
}

function ClientCard({
  client,
  isDuplicate,
}: {
  client: Client;
  isDuplicate: boolean;
}) {
  return (
    <article
      className="flex w-[280px] shrink-0 flex-col justify-between rounded-xl border bg-background p-5 shadow-sm sm:w-[340px]"
      aria-hidden={isDuplicate}
    >
      <div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
              {getInitials(client.name)}
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold">{client.name}</h3>
              <p className="truncate text-xs text-muted-foreground">
                {client.industry}
              </p>
            </div>
          </div>
          <Quote className="size-4 shrink-0 text-muted-foreground" />
        </div>
        <p className="mt-5 text-sm leading-6 text-muted-foreground">
          &quot;{client.quote}&quot;
        </p>
      </div>
      <div className="mt-6 flex items-center gap-2 border-t pt-4 text-xs font-medium">
        <Building2 className="size-3.5 text-muted-foreground" />
        {client.metric}
      </div>
    </article>
  );
}
