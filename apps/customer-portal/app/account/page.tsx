import { fetchCurrentCustomer } from "@/src/features/account/api/account-api";
import { AccountContent } from "@/src/features/account/components/account-content";

export default async function AccountOverviewPage() {
  const customer = await fetchCurrentCustomer();

  return (
    <AccountContent title="Account overview" description="Your personal details.">
      <dl className="grid gap-6 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-muted-foreground">Full name</dt>
          <dd className="mt-1 text-base font-medium text-foreground">
            {customer.firstName} {customer.lastName}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Email</dt>
          <dd className="mt-1 text-base font-medium text-foreground">{customer.email}</dd>
        </div>
      </dl>
    </AccountContent>
  );
}
