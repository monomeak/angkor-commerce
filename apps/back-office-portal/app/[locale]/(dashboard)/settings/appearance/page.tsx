"use client";
import { Monitor, Moon, Palette, Rows3, Sun } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppTheme, type Theme } from "@/app/providers/theme-provider";

const themeOptions: {
  title: string;
  value: Theme;
  description: string;
  icon: typeof Sun;
}[] = [
  {
    title: "Light",
    value: "light",
    description: "Bright interface for daytime work.",
    icon: Sun,
  },
  {
    title: "Dark",
    value: "dark",
    description: "Lower contrast for late sessions.",
    icon: Moon,
  },
  {
    title: "System",
    value: "system",
    description: "Follow your device preference.",
    icon: Monitor,
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
    value: "Angkor Blue",
    description: "Used for active states, primary buttons, and highlights.",
  },
  {
    label: "Date format",
    value: "MMM D, YYYY",
    description: "Applied to invoices, reports, and activity history.",
  },
];

export default function Appearance() {
  const { theme, setTheme } = useAppTheme();

  const handleChangeTheme = (value: Theme) => {
    setTheme(value);
  };

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
            {themeOptions.map((option) => {
              const isActive = theme === option.value;
              const Icon = option.icon;

              return (
                <Button
                  key={option.value}
                  type="button"
                  variant="outline"
                  onClick={() => handleChangeTheme(option.value)}
                  data-active={isActive}
                  aria-pressed={isActive}
                  className="h-auto min-h-36 w-full items-start justify-start whitespace-normal rounded-lg bg-background p-4 text-left transition-colors hover:bg-muted/50 data-[active=true]:border-primary data-[active=true]:bg-primary/5"
                >
                  <div className="flex w-full flex-col items-start gap-3">
                    <div className="flex w-full items-center justify-between gap-3">
                      <Icon className="size-5 text-muted-foreground" />
                      {isActive && (
                        <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <h2 className="font-medium">{option.title}</h2>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </Button>
              );
            })}
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
