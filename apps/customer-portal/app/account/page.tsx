import { AccountAddressCard } from "@/src/features/account/components/account-address-card";
import { AccountContent } from "@/src/features/account/components/account-content";
import { AccountProfileForm } from "@/src/features/account/components/account-profile-form";

export default function AccountOverviewPage() {
  return (
    <div className="flex flex-col gap-6">
      <AccountContent title="Account overview" description="Your personal details.">
        <AccountProfileForm />
      </AccountContent>

      <AccountContent
        title="Shipping address"
        description="Saved here auto-fills checkout so you don't retype it every order."
      >
        <AccountAddressCard />
      </AccountContent>
    </div>
  );
}
