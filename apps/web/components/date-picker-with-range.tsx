"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerWithRangeProps {
  readonly id: string;
  readonly label: string;
  readonly value?: DateRange;
  readonly onChange: (value: DateRange | undefined) => void;
}

export function DatePickerWithRange({
  id,
  label,
  value,
  onChange,
}: DatePickerWithRangeProps) {
  return (
    <Field className="w-full min-w-0">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              id={id}
              className="w-full min-w-0 justify-start overflow-hidden px-2.5 font-normal"
            >
              <CalendarIcon data-icon="inline-start" className="shrink-0" />
              <span className="min-w-0 truncate">
                {value?.from
                  ? value.to
                    ? `${format(value.from, "LLL dd, y")} - ${format(value.to, "LLL dd, y")}`
                    : format(value.from, "LLL dd, y")
                  : "Pick a date"}
              </span>
            </Button>
          }
        />
        <PopoverContent className="w-auto max-w-[calc(100vw-2rem)] p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            className="[--cell-size:--spacing(6)] sm:[--cell-size:--spacing(7)]"
          />
          {value && (
            <div className="border-t p-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => onChange(undefined)}
              >
                Clear dates
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </Field>
  );
}
