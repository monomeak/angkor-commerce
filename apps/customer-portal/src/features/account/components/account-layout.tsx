import { fetchCurrentCustomer } from "../api/account-api";
import { AccountSidebar } from "./account-sidebar";

type AccountLayoutProps = {
  readonly children: React.ReactNode;
};

export async function AccountLayout({ children }: AccountLayoutProps) {
  const customer = await fetchCurrentCustomer();

  return (
    <div className="flex-1 bg-muted">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-start md:gap-10">
        <AccountSidebar customer={customer} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
