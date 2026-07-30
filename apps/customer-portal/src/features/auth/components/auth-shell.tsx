import Image from "next/image";

import { BrandLogo } from "@/components/brand/brand-logo";
import { cn } from "@/lib/utils";

type AuthShellProps = {
  readonly children: React.ReactNode;
  readonly imageSrc?: string;
  readonly imageAlt?: string;
  readonly imagePosition?: "left" | "right";
};

export function AuthShell({
  children,
  imageSrc = "/hero-1.png",
  imageAlt = "Angkor Commerce",
  imagePosition = "left",
}: AuthShellProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-6 bg-secondary/40 px-4 py-10 sm:px-6 lg:py-16">
      <BrandLogo className="lg:hidden" />

      <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl bg-background shadow-xl ring-1 ring-foreground/5 lg:min-h-[600px] lg:grid-cols-2">
        <div
          className={cn(
            "relative hidden lg:block",
            imagePosition === "right" && "lg:order-2",
          )}
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority
            sizes="50vw"
            className="object-cover"
          />
          <div className="absolute bottom-6 left-6 rounded-full bg-background/90 px-3 py-1.5 shadow-sm backdrop-blur">
            <BrandLogo />
          </div>
        </div>

        <div className="flex flex-col">{children}</div>
      </div>
    </div>
  );
}
