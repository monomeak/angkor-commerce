import { AccountContent } from "@/src/features/account/components/account-content";
import { AccountProfileForm } from "@/src/features/account/components/account-profile-form";
import { AddressBook } from "@/src/features/addresses/components/address-book";

export default function AccountOverviewPage() {
  return (
    <div className="flex flex-col gap-6">
      <AccountContent title="Account overview" description="Your personal details.">
        <AccountProfileForm />
      </AccountContent>

      <AccountContent
        title="Shipping addresses"
        description="Save up to three. The default one fills in at checkout so you don't retype it every order."
      >
        <AddressBook />
      </AccountContent>
    </div>
  );
}
