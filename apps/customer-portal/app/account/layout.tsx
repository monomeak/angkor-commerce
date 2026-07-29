import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AccountLayout } from "@/src/features/account/components/account-layout";

export default function AccountRouteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <AccountLayout>{children}</AccountLayout>
      <SiteFooter />
    </div>
  );
}
