import { CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AccountContent } from "@/src/features/account/components/account-content";

export default function AccountPaymentMethodsPage() {
  return (
    <AccountContent title="Payment methods" description="Manage the cards saved to your account.">
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <CreditCard className="size-10 text-muted-foreground" />
        <p className="text-account-text">No payment methods added yet.</p>
        <Button disabled className="mt-2">
          Add payment method
        </Button>
      </div>
    </AccountContent>
  );
}
