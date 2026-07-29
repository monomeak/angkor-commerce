import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AccountContent } from "@/src/features/account/components/account-content";

export default function AccountOrdersPage() {
  return (
    <AccountContent title="My orders" description="Track and review your past orders.">
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <ShoppingCart className="size-10 text-muted-foreground" />
        <p className="text-account-text">You haven&apos;t placed any orders yet.</p>
        <Button nativeButton={false} render={<Link href="/" />} className="mt-2">
          Continue shopping
        </Button>
      </div>
    </AccountContent>
  );
}
