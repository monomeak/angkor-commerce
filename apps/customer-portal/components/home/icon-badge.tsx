import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const sizes = {
  md: { badge: "size-10 rounded-lg", icon: "size-5" },
  lg: { badge: "size-14 rounded-xl", icon: "size-7" },
  xl: { badge: "size-32 rounded-3xl", icon: "size-14" },
} as const;

export function IconBadge({
  icon: Icon,
  size = "md",
  className,
}: {
  icon: LucideIcon;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const styles = sizes[size];

  return (
    <span
      className={cn(
        "flex items-center justify-center bg-muted text-primary ring-1 ring-border",
        styles.badge,
        className,
      )}
    >
      <Icon className={styles.icon} />
    </span>
  );
}
