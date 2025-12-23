"use client";

import * as React from "react";
import { format, parse } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { type DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar05 } from "@/components/customized/date-range-calendar";
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
      return parse(dateStr, "yyyy-MM-dd", new Date());
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
      const fromDateStr = format(range.from, "yyyy-MM-dd");
      onFromDateChange(fromDateStr);
    } else {
      onFromDateChange("");
    }
    
    // Update to date if it exists
    if (range.to) {
      const toDateStr = format(range.to, "yyyy-MM-dd");
      onToDateChange(toDateStr);
      // Close popover when both dates are selected
      setOpen(false);
    } else {
      // If only from date is selected, clear to date but keep calendar open
      onToDateChange("");
    }
  };

  // Format date for display: dd-MMM-yyyy (e.g., "01-Dec-2025")
  const formatDisplayDate = (date: Date) => {
    return format(date, "dd-MMM-yyyy");
  };

  // Determine which month to show first in the calendar
  const defaultMonth = React.useMemo(() => {
    if (fromDateObj) return fromDateObj;
    if (toDateObj) return toDateObj;
    return new Date();
  }, [fromDateObj, toDateObj]);

  // Display text for the button
  const displayText = React.useMemo(() => {
    if (fromDateObj && toDateObj) {
      return `${formatDisplayDate(fromDateObj)} - ${formatDisplayDate(toDateObj)}`;
    }
    if (fromDateObj) {
      return formatDisplayDate(fromDateObj);
    }
    return "";
  }, [fromDateObj, toDateObj]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          size="sm"
          className={cn(
            "w-full justify-start text-left font-normal h-9 text-sm min-w-[240px] max-w-[280px]",
            "bg-background hover:bg-accent/50 transition-colors",
            "border-input shadow-sm",
            !fromDateObj && !toDateObj && "text-muted-foreground",
            fromDateObj && toDateObj && "text-foreground font-medium"
          )}
        >
          <CalendarIcon className="mr-2 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate text-sm">
            {displayText || (
              <span className="text-muted-foreground font-normal">
                {startPlaceholder} - {endPlaceholder}
              </span>
            )}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar05
          dateRange={dateRange}
          onSelect={handleRangeSelect}
          defaultMonth={defaultMonth}
        />
      </PopoverContent>
    </Popover>
  );
}
