"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { type DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type DateRangePickerProps = {
  fromDate: string;
  toDate: string;
  onFromDateChange: (date: string) => void;
  onToDateChange: (date: string) => void;
  startPlaceholder: string;
  endPlaceholder: string;
  id?: string;
};

// Format date for display: MMM DD, YYYY (e.g., "Nov 23, 2025")
const formatDate = (date: Date | undefined): string => {
  if (!date) return "";
  return date.toLocaleDateString("en-US", { 
    month: "short", 
    day: "numeric", 
    year: "numeric" 
  });
};

export function DateRangePicker({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  startPlaceholder,
  endPlaceholder,
  id,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  
  // Parse string dates to Date objects (handle yyyy-MM-dd format)
  const parseDate = React.useCallback((dateStr: string): Date | undefined => {
    if (!dateStr) return undefined;
    try {
      // Try parsing yyyy-MM-dd format
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      }
      return new Date(dateStr);
    } catch {
      return undefined;
    }
  }, []);

  const fromDateObj = React.useMemo(() => parseDate(fromDate), [fromDate, parseDate]);
  const toDateObj = React.useMemo(() => parseDate(toDate), [toDate, parseDate]);
  
  // Create date range from props
  const dateRange = React.useMemo<DateRange | undefined>(() => {
    if (fromDateObj || toDateObj) {
      return {
        from: fromDateObj,
        to: toDateObj,
      };
    }
    return undefined;
  }, [fromDateObj, toDateObj]);

  const handleRangeSelect = (range: DateRange | undefined) => {
    if (!range) {
      onFromDateChange("");
      onToDateChange("");
      return;
    }
    
    // Update from date if it exists
    if (range.from) {
      const fromDateStr = range.from.toISOString().split("T")[0];
      onFromDateChange(fromDateStr);
    } else {
      onFromDateChange("");
    }
    
    // Update to date if it exists
    if (range.to) {
      const toDateStr = range.to.toISOString().split("T")[0];
      onToDateChange(toDateStr);
    } else {
      onToDateChange("");
    }
  };

  // Determine which month to show first in the calendar
  const defaultMonth = React.useMemo(() => {
    if (fromDateObj) return fromDateObj;
    if (toDateObj) return toDateObj;
    return new Date();
  }, [fromDateObj, toDateObj]);

  // Display text for the button
  const displayText = React.useMemo(() => {
    if (dateRange?.from && dateRange?.to) {
      return `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`;
    }
    if (dateRange?.from) {
      return `${formatDate(dateRange.from)} - ...`;
    }
    return "";
  }, [dateRange]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          size="sm"
          className={cn(
            "w-full justify-start text-left font-normal h-9 text-sm min-w-[240px] max-w-[280px] gap-2",
            "bg-background hover:bg-accent/50 transition-colors",
            "border-input shadow-sm",
            !dateRange && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate text-sm">
            {displayText || (
              <span className="text-muted-foreground font-normal">
                from Date - to Date
              </span>
            )}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={defaultMonth}
          selected={dateRange}
          onSelect={handleRangeSelect}
          numberOfMonths={2}
          className="rounded-lg border shadow-sm"
        />
        {dateRange && (
          <div className="p-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                handleRangeSelect(undefined);
              }}
              className="h-8 w-full text-sm"
            >
              Clear
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
