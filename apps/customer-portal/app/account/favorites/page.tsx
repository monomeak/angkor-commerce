import Link from "next/link";
import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AccountContent } from "@/src/features/account/components/account-content";

export default function AccountFavoritesPage() {
  return (
    <AccountContent title="My favorites" description="Products you've saved for later.">
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <Heart className="size-10 text-muted-foreground" />
        <p className="text-account-text">You haven&apos;t added any favorites yet.</p>
        <Button nativeButton={false} render={<Link href="/" />} className="mt-2">
          Browse products
        </Button>
      </div>
    </AccountContent>
  );
}
