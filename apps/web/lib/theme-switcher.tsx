"use client";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  let ThemeIcon = Laptop;

  if (theme === "light") {
    ThemeIcon = Sun;
  } else if (theme === "dark") {
    ThemeIcon = Moon;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Change theme" />
        }
      >
        {/* <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" /> */}
        <ThemeIcon size="size-4"></ThemeIcon>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-fit">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          aria-label="Light theme"
        >
          <Sun className="size-4" />
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          aria-label="Dark theme"
        >
          <Moon className="size-4" />
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          aria-label="Device theme"
        >
          <Laptop className="size-4" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
