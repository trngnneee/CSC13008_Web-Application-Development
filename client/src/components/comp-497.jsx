"use client";;
import { useState } from "react";

import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Component() {
  const [date, setDate] = useState(new Date());

  const handleCalendarChange = (
    _value,
    _e,
  ) => {
    const _event = {
      target: {
        value: String(_value),
      }
    };
    _e(_event);
  };

  return (
    <div>
      <Calendar
        captionLayout="dropdown"
        className="rounded-md border p-2"
        classNames={{
          month_caption: "mx-0",
        }}
        components={{
          Dropdown: (props) => {
            return (
              <Select
                onValueChange={(value) => {
                  if (props.onChange) {
                    handleCalendarChange(value, props.onChange);
                  }
                }}
                value={String(props.value)}>
                <SelectTrigger className="h-8 w-fit font-medium first:grow">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className="max-h-[min(26rem,var(--radix-select-content-available-height))]">
                  {props.options?.map((option) => (
                    <SelectItem
                      disabled={option.disabled}
                      key={option.value}
                      value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          },
          DropdownNav: (props) => {
            return (
              <div className="flex w-full items-center gap-2">
                {props.children}
              </div>
            );
          },
        }}
        defaultMonth={new Date()}
        hideNavigation
        mode="single"
        onSelect={setDate}
        selected={date}
        startMonth={new Date(1980, 6)} />
      <p
        aria-live="polite"
        className="mt-4 text-center text-muted-foreground text-xs"
        role="region">
        Monthly / yearly selects -{" "}
        <a
          className="underline hover:text-foreground"
          href="https://daypicker.dev/"
          rel="noreferrer noopener nofollow"
          target="_blank">
          React DayPicker
        </a>
      </p>
    </div>
  );
}
