"use client"

import * as React from "react"
import { type DateRange } from "react-day-picker"

import { Calendar } from "@/components/ui/calendar"

type Calendar05Props = {
  dateRange?: DateRange | undefined;
  onSelect?: (range: DateRange | undefined) => void;
  defaultMonth?: Date;
}

export function Calendar05({ 
  dateRange, 
  onSelect,
  defaultMonth 
}: Calendar05Props) {
  const [localRange, setLocalRange] = React.useState<DateRange | undefined>(dateRange)

  React.useEffect(() => {
    setLocalRange(dateRange)
  }, [dateRange])

  const handleSelect = (range: DateRange | undefined) => {
    setLocalRange(range)
    if (onSelect) {
      onSelect(range)
    }
  }

  return (
    <Calendar
      mode="range"
      defaultMonth={defaultMonth || localRange?.from || new Date()}
      selected={localRange}
      onSelect={handleSelect}
      numberOfMonths={2}
      className="rounded-lg border shadow-sm"
    />
  )
}
