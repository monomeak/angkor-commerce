import { trustedClients } from "@/components/home/data";

export function TrustedTeams() {
  return (
    <section className="border-y bg-muted/30">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-5 py-7 text-center sm:px-8 md:flex-row md:text-left">
        <p className="max-w-xs text-sm text-muted-foreground">
          Trusted by focused teams building healthier businesses.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-9 gap-y-3 text-sm font-semibold tracking-tight text-muted-foreground/75 sm:text-base">
          {trustedClients.map((client) => (
            <span key={client}>{client}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
