// app/unauthorized/page.tsx

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function UnauthorizedPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <p className="text-sm font-medium text-muted-foreground">Error 403</p>

          <CardTitle className="text-2xl">Access denied</CardTitle>

          <CardDescription className="max-w-sm">
            You do not have permission to access this page. Contact your shop
            administrator if you believe this is a mistake.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex justify-center">
          <Button nativeButton={false} render={<Link href="/overview"></Link>}>
            Back to overview
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
