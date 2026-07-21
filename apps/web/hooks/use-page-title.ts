"use client";
import { usePathname } from "next/navigation";
import { PAGE_TITLES } from "@/lib/route-labels";
// looks up the current pathname in Page-Title

export function usePageTitle(): string {
  const pathname = usePathname();
  return PAGE_TITLES[pathname] ?? "Overview";
}
