import { AccountContent } from "@/src/features/account/components/account-content";
import { PaymentMethodsManager } from "@/src/features/payment-methods/components/payment-methods-manager";

export default function AccountPaymentMethodsPage() {
  return (
    <AccountContent title="Payment methods" description="Manage the cards saved to your account.">
      <PaymentMethodsManager />
    </AccountContent>
  );
}
