"use client";
import { SidebarTrigger } from "../ui/sidebar";
import { Button } from "../ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

import Link from "next/link";
import { usePageTitle } from "@/hooks/use-page-title";
type dashboardHeaderProps = {
  readonly profilePath?: string;
};

export default function DashboardHeader({ profilePath }: dashboardHeaderProps) {
  const [locale, setLocale] = useState<"en" | "km">("en");
  const pageTitle = usePageTitle();
  const currentLocaleFlag = locale === "en" ? "fi-gb " : "fi-kh ";
  const currentLocaleText = locale === "en" ? "English" : "ខ្មែរ";
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur md:px-6">
      <SidebarTrigger></SidebarTrigger>

      <div className="relative hidden max-w-sm flex-1 overflow-hidden md:block">
        <h1
          key={pageTitle}
          className="animate-in fade-in slide-in-from-bottom-2 font-heading text-xl font-semibold leading-none tracking-[-0.025em] text-foreground duration-300 ease-out sm:text-2xl motion-reduce:animate-none"
        >
          {pageTitle}
        </h1>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" aria-label="Change language"></Button>
            }
            className="flex gap-2"
          >
            <span
              className={`fi ${currentLocaleFlag}`}
              aria-hidden="true"
            ></span>
            <span>{currentLocaleText}</span>
          </DropdownMenuTrigger>
          {/* Dropdown content here */}

          <DropdownMenuContent align="end">
            <DropdownMenuItem className="gap-3" onClick={() => setLocale("en")}>
              <span className="fi fi-gb " aria-hidden="true"></span>
              <span className="text-muted-foreground">English</span>
            </DropdownMenuItem>

            <DropdownMenuItem className="gap-3" onClick={() => setLocale("km")}>
              <span className="fi fi-kh" aria-hidden="true"></span>
              <span className="text-muted-foreground">ខ្មែរ</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="ml-auto flex items-center gap-2">
          <AvatarDemo profilePath={profilePath} />
        </div>
      </div>
    </header>
  );
}

export function AvatarDemo({ profilePath }: dashboardHeaderProps) {
  return (
    <Link href={"/settings/profile"}>
      <Avatar className="cursor-pointer">
        <AvatarImage src={profilePath} alt="@shadcn" />
        <AvatarFallback>UR</AvatarFallback>
      </Avatar>
    </Link>
  );
}
