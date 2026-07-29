import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  href?: string;
  showName?: boolean;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: {
    mark: "size-7 rounded-lg",
    icon: "size-4",
    name: "h-7 text-sm",
  },
  md: {
    mark: "size-9 rounded-xl",
    icon: "size-5",
    name: "h-9 text-lg",
  },
  lg: {
    mark: "size-11 rounded-xl",
    icon: "size-5",
    name: "h-11 text-lg",
  },
} as const;

export function BrandLogo({
  className,
  href = "/",
  showName = true,
  size = "md",
}: BrandLogoProps) {
  const styles = sizes[size];
  const content = (
    <>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center bg-primary text-primary-foreground shadow-sm",
          styles.mark,
        )}
      >
        <ShoppingBag className={styles.icon} />
      </span>
      {showName && (
        <span
          className={cn(
            "flex translate-y-px items-center font-semibold leading-none tracking-tight",
            styles.name,
          )}
        >
          Angkor Commerce
        </span>
      )}
    </>
  );

  return (
    <Link
      href={href}
      className={cn("inline-flex items-center justify-center gap-2.5", className)}
      aria-label="Angkor Commerce home"
    >
      {content}
    </Link>
  );
}
