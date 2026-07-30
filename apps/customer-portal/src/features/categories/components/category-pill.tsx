import Link from "next/link";

type CategoryPillProps = {
  readonly href: string;
  readonly label: string;
  readonly active: boolean;
};

export function CategoryPill({ href, label, active }: CategoryPillProps) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full border border-primary bg-primary/10 px-3 py-1 text-sm font-medium text-foreground"
          : "rounded-full border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
      }
    >
      {label}
    </Link>
  );
}
