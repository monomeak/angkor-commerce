import { AccountContent } from "@/src/features/account/components/account-content";
import { OrdersList } from "@/src/features/orders/components/orders-list";

export default function AccountOrdersPage() {
  return (
    <AccountContent title="My orders" description="Track and review your past orders.">
      <OrdersList />
    </AccountContent>
  );
}
