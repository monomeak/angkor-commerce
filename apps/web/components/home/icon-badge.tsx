import type { LucideIcon } from "lucide-react";

export function IconBadge({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="flex size-10 items-center justify-center rounded-lg bg-muted ring-1 ring-border">
      <Icon className="size-5" />
    </span>
  );
}
