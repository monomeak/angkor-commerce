import type { ReactNode } from "react";

import { AcmeLogo } from "@/components/acme-logo";

type AuthLayoutProps = {
  readonly children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="grid min-h-dvh place-items-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <AcmeLogo className="mx-auto" href="/" size="lg" showName={false} />
          <p className="mt-2 text-md text-muted-foreground">
            Invoice Management System
          </p>
        </div>

        {children}
      </div>
    </main>
  );
}
