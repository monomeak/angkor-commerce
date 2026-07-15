"use client";
import { Languages, Search } from "lucide-react";
import { SidebarTrigger } from "../ui/sidebar";
import { Input } from "@base-ui/react";
import { Button } from "../ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { useRouter } from "next/router";

import Link from "next/link";

export default function DashboardHeader() {
  const [locale, setLocale] = useState<"en" | "km">("en");
  const currentLocale = locale === "en" ? "fi-gb" : "fi-kh";
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur md:px-6">
      <SidebarTrigger></SidebarTrigger>

      <div className="relative hidden max-w-sm flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search invoices, customers..." />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label="Change language"
              ></Button>
            }
          >
            <span className={`fi ${currentLocale}`} aria-hidden="true"></span>
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
          <AvatarDemo />
        </div>
      </div>
    </header>
  );
}

export function AvatarDemo() {
  return (
    <Link href={"/settings/profile"}>
      <Avatar className="cursor-pointer">
        <AvatarImage
          src="https://github.com/shadcn.png"
          alt="@shadcn"
          className="grayscale"
        />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    </Link>
  );
}
