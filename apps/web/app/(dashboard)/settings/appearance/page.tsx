import { Monitor, Moon, Palette, Rows3, Sun } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const themeOptions = [
  {
    title: "Light",
    description: "Bright interface for daytime work.",
    icon: Sun,
    active: false,
  },
  {
    title: "Dark",
    description: "Lower contrast for late sessions.",
    icon: Moon,
    active: false,
  },
  {
    title: "System",
    description: "Follow your device preference.",
    icon: Monitor,
    active: true,
  },
];

const preferences = [
  {
    label: "Interface density",
    value: "Comfortable",
    description: "More spacing around tables, forms, and navigation items.",
  },
  {
    label: "Accent color",
    value: "Acme Blue",
    description: "Used for active states, primary buttons, and highlights.",
  },
  {
    label: "Date format",
    value: "MMM D, YYYY",
    description: "Applied to invoices, reports, and activity history.",
  },
];

export default function Appearance() {
  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="size-4" />
            Theme
          </CardTitle>
          <CardDescription>
            Choose how the dashboard should look across your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {themeOptions.map((option) => (
              <div
                key={option.title}
                className="rounded-lg border bg-background p-4 data-[active=true]:border-primary data-[active=true]:bg-primary/5"
                data-active={option.active}
              >
                <div className="flex items-center justify-between gap-3">
                  <option.icon className="size-5 text-muted-foreground" />
                  {option.active && (
                    <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      Active
                    </span>
                  )}
                </div>
                <h2 className="mt-3 font-medium">{option.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {option.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rows3 className="size-4" />
            Display Preferences
          </CardTitle>
          <CardDescription>
            Static defaults for dashboard layout and formatting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            {preferences.map((preference) => (
              <div
                key={preference.label}
                className="grid gap-2 py-4 first:pt-0 last:pb-0 md:grid-cols-[180px_1fr_auto]"
              >
                <dt className="text-sm font-medium">{preference.label}</dt>
                <dd className="text-sm text-muted-foreground">
                  {preference.description}
                </dd>
                <dd className="w-fit rounded-md border bg-muted/40 px-2.5 py-1 text-xs font-medium">
                  {preference.value}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
