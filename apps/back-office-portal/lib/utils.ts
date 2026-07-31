import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatLongDate(dateValue: string | Date) {
  const date = new Date(dateValue);

  const weekday = date.toLocaleDateString("en-GB", {
    weekday: "long",
    timeZone: "UTC",
  });

  const dayMonth = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    timeZone: "UTC",
  });

  return `${weekday}, ${dayMonth}`;
}

export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return "Good morning";
  }

  if (hour === 12) {
    return "Good noon";
  }

  if (hour >= 13 && hour < 17) {
    return "Good afternoon";
  }

  if (hour >= 17 && hour < 21) {
    return "Good evening";
  }

  return "Good night";
}
