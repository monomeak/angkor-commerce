"use client";

import { useState, type ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AuthFieldProps = {
  readonly id: string;
  readonly label: string;
  readonly type?: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly required?: boolean;
  readonly endAdornment?: ReactNode;
  readonly className?: string;
};

export function AuthField({
  id,
  label,
  type = "text",
  value,
  onChange,
  required,
  endAdornment,
  className,
}: AuthFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const floated = isFocused || value.length > 0;

  return (
    <div
      className={cn(
        "relative flex h-14 items-center gap-2 rounded-xl border bg-background px-4 transition-colors",
        floated ? "border-ring" : "border-input",
        className,
      )}
    >
      <label
        htmlFor={id}
        className={cn(
          "pointer-events-none absolute left-3 -translate-y-1/2 select-none bg-background px-1 transition-all duration-150",
          floated
            ? "top-0 text-xs font-medium text-ring"
            : "top-1/2 text-base text-muted-foreground",
        )}
      >
        {label}
      </label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        required={required}
        className="h-full w-full border-none bg-transparent p-0 text-base shadow-none focus-visible:ring-0"
      />
      {endAdornment}
    </div>
  );
}
