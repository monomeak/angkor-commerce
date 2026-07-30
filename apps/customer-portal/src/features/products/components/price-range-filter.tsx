"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { PRICE_FILTER_MAX, PRICE_FILTER_MIN } from "../lib/price-filter";

type PriceRangeFilterProps = {
  readonly minPrice: number;
  readonly maxPrice: number;
  readonly basePath: string;
  readonly params: Record<string, string | undefined>;
};

function buildHref(
  basePath: string,
  params: Record<string, string | undefined>,
  minPrice: number,
  maxPrice: number,
): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      searchParams.set(key, value);
    }
  }

  if (minPrice !== PRICE_FILTER_MIN) {
    searchParams.set("minPrice", String(minPrice));
  }
  if (maxPrice !== PRICE_FILTER_MAX) {
    searchParams.set("maxPrice", String(maxPrice));
  }

  const qs = searchParams.toString();
  return `${basePath}${qs ? `?${qs}` : ""}`;
}

export function PriceRangeFilter({ minPrice, maxPrice, basePath, params }: PriceRangeFilterProps) {
  const router = useRouter();
  const [value, setValue] = useState([minPrice, maxPrice]);

  return (
    <div className="grid w-full max-w-xs gap-3">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="price-filter">Price</Label>
        <span className="text-sm text-muted-foreground">
          ${value[0]} – ${value[1]}
        </span>
      </div>
      <Slider
        id="price-filter"
        value={value}
        onValueChange={(next) => setValue(next as number[])}
        onValueCommitted={(next) => {
          const [nextMin, nextMax] = next as number[];
          router.push(buildHref(basePath, params, nextMin, nextMax));
        }}
        min={PRICE_FILTER_MIN}
        max={PRICE_FILTER_MAX}
        step={1}
      />
    </div>
  );
}
