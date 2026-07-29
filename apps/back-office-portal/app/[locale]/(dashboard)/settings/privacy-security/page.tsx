import {
  Clock3,
  Database,
  KeyRound,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const securityItems = [
  {
    title: "Password",
    description: "Last changed 18 days ago.",
    status: "Healthy",
    icon: KeyRound,
  },

  {
    title: "Active sessions",
    description: "2 trusted devices currently signed in.",
    status: "Reviewed",
    icon: Clock3,
  },
];

const privacyItems = [
  {
    label: "Profile visibility",
    value: "Workspace only",
    description: "Your profile is visible to members of this organization.",
  },
  {
    label: "Activity history",
    value: "Enabled",
    description: "Recent invoice and report actions are saved for auditing.",
  },
  {
    label: "Data export",
    value: "Available",
    description: "Account and invoice activity can be exported by admins.",
  },
];

export default function PrivacySecurity() {
  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-4" />
            Security Overview
          </CardTitle>
          <CardDescription>
            Current account protection settings for this workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 lg:grid-cols-2">
            {securityItems.map((item) => (
              <div
                key={item.title}
                className="rounded-lg border bg-background p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <item.icon className="size-5 text-muted-foreground" />
                  <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    {item.status}
                  </span>
                </div>
                <h2 className="mt-3 font-medium">{item.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="size-4" />
            Privacy Controls
          </CardTitle>
          <CardDescription>
            Static defaults for data visibility and retention.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            {privacyItems.map((item) => (
              <div
                key={item.label}
                className="grid gap-2 py-4 first:pt-0 last:pb-0 md:grid-cols-[180px_1fr_auto]"
              >
                <dt className="text-sm font-medium">{item.label}</dt>
                <dd className="text-sm text-muted-foreground">
                  {item.description}
                </dd>
                <dd className="w-fit rounded-md border bg-muted/40 px-2.5 py-1 text-xs font-medium">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
