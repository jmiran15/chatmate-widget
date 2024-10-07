import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "../lib/utils";
import { buttonVariants } from "./button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("cm-p-3", className)}
      classNames={{
        months:
          "cm-flex cm-flex-col sm:cm-flex-row cm-space-y-4 sm:cm-space-x-4 sm:cm-space-y-0",
        month: "cm-space-y-4",
        caption:
          "cm-flex cm-justify-center cm-pt-1 cm-relative cm-items-center",
        caption_label: "cm-text-sm cm-font-medium",
        nav: "cm-space-x-1 cm-flex cm-items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "cm-h-7 cm-w-7 cm-bg-transparent cm-opacity-50 hover:cm-opacity-100 [&>*]:cm-p-0"
        ),
        nav_button_previous: "cm-absolute cm-left-1",
        nav_button_next: "cm-absolute cm-right-1",
        table: "cm-w-full cm-border-collapse cm-space-y-1",
        head_row: "cm-flex",
        head_cell:
          "cm-text-muted-foreground cm-rounded-md cm-w-9 cm-font-normal cm-text-[0.8rem]",
        row: "cm-flex cm-w-full cm-mt-2",
        cell: "cm-h-9 cm-w-9 cm-text-center cm-text-sm cm-p-0 cm-relative [&:has([aria-selected].day-range-end)]:cm-rounded-r-md [&:has([aria-selected].day-outside)]:cm-bg-accent/50 [&:has([aria-selected])]:cm-bg-accent first:[&:has([aria-selected])]:cm-rounded-l-md last:[&:has([aria-selected])]:cm-rounded-r-md focus-within:cm-relative focus-within:cm-z-[9999]",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "cm-h-9 cm-w-9 cm-p-0 cm-font-normal aria-selected:cm-opacity-100"
        ),
        day_range_end: "cm-day-range-end",
        day_selected:
          "cm-bg-primary cm-text-primary-foreground hover:cm-bg-primary hover:cm-text-primary-foreground focus:cm-bg-primary focus:cm-text-primary-foreground",
        day_today: "cm-bg-accent cm-text-accent-foreground",
        day_outside:
          "cm-day-outside cm-text-muted-foreground cm-opacity-50 aria-selected:cm-bg-accent/50 aria-selected:cm-text-muted-foreground aria-selected:cm-opacity-30",
        day_disabled: "cm-text-muted-foreground cm-opacity-50",
        day_range_middle:
          "aria-selected:cm-bg-accent aria-selected:cm-text-accent-foreground",
        day_hidden: "cm-invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => (
          <ChevronLeft className="cm-h-4 cm-w-4 cm-text-primary" />
        ),
        IconRight: ({ ...props }) => (
          <ChevronRight className="cm-h-4 cm-w-4 cm-text-primary" />
        ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
