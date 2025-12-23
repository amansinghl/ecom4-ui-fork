"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ColumnVisibility = {
  name: string;
  visibility: boolean;
  sortable?: boolean | string;
};

export type ColumnVisibilityConfig = Record<string, ColumnVisibility>;

// Default column visibility configuration
export const defaultColumnVisibility: ColumnVisibilityConfig = {
  shipment_no: {
    name: "Shipment No.",
    visibility: true,
    sortable: "custom",
  },
  awb_no: {
    name: "AWB",
    visibility: true,
    sortable: "custom",
  },
  supplier_id: {
    name: "Partner",
    visibility: true,
    sortable: false,
  },
  tracking_status: {
    name: "Tracking Status",
    visibility: true,
  },
  shipment_date: {
    name: "Booked On",
    visibility: true,
    sortable: false,
  },
  delivered_date: {
    name: "Delivered On",
    visibility: true,
    sortable: "custom",
  },
  reference1: {
    name: "Reference1",
    visibility: true,
    sortable: false,
  },
  cod_amount: {
    name: "COD Value",
    visibility: true,
    sortable: false,
  },
  paid_amount: {
    name: "COD Paid",
    visibility: true,
    sortable: false,
  },
  cod_status: {
    name: "COD Status",
    visibility: true,
    sortable: false,
  },
  cod_aging: {
    name: "Paid in (days)",
    visibility: true,
  },
  payment_date: {
    name: "Paid On",
    visibility: true,
    sortable: false,
  },
  payment_ref_no: {
    name: "UTR No.",
    visibility: true,
    sortable: "custom",
  },
};

type ColumnConfigDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columnVisibility: ColumnVisibilityConfig;
  onColumnVisibilityChange: (visibility: ColumnVisibilityConfig) => void;
};

export function ColumnConfigDialog({
  open,
  onOpenChange,
  columnVisibility,
  onColumnVisibilityChange,
}: ColumnConfigDialogProps) {
  const [localVisibility, setLocalVisibility] = useState<ColumnVisibilityConfig>(columnVisibility);
  const [searchQuery, setSearchQuery] = useState("");
  const showAllCheckboxRef = useRef<HTMLButtonElement>(null);

  // Sync local state with props when dialog opens
  useEffect(() => {
    if (open) {
      setLocalVisibility(columnVisibility);
      setSearchQuery("");
    }
  }, [open, columnVisibility]);

  // Calculate "Show All" checkbox state
  const { areAllColumnsShown, isIndeterminate, visibleCount, totalCount } = useMemo(() => {
    const visibilityValues = Object.values(localVisibility);
    const numberOfColumnsShown = visibilityValues.filter((obj) => obj.visibility).length;
    const totalColumns = visibilityValues.length;

    return {
      areAllColumnsShown: numberOfColumnsShown === totalColumns,
      isIndeterminate: numberOfColumnsShown > 0 && numberOfColumnsShown < totalColumns,
      visibleCount: numberOfColumnsShown,
      totalCount: totalColumns,
    };
  }, [localVisibility]);

  // Set indeterminate state on checkbox
  useEffect(() => {
    if (showAllCheckboxRef.current) {
      showAllCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  // Filter columns based on search query
  const filteredColumns = useMemo(() => {
    const entries = Object.entries(localVisibility);
    if (!searchQuery.trim()) return entries;
    
    const query = searchQuery.toLowerCase();
    return entries.filter(([_, config]) =>
      config.name.toLowerCase().includes(query)
    );
  }, [localVisibility, searchQuery]);

  const toggleShowAllColumns = (checked: boolean) => {
    const updated = { ...localVisibility };
    Object.keys(updated).forEach((key) => {
      updated[key] = { ...updated[key], visibility: checked };
    });
    setLocalVisibility(updated);
  };

  const toggleShowColumn = (key: string) => {
    const updated = {
      ...localVisibility,
      [key]: {
        ...localVisibility[key],
        visibility: !localVisibility[key].visibility,
      },
    };
    setLocalVisibility(updated);
  };

  const handleApply = () => {
    onColumnVisibilityChange(localVisibility);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setLocalVisibility(columnVisibility);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Visible Columns</DialogTitle>
          <DialogDescription className="text-sm">
            Select which columns to display in the table
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search columns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9 h-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Show All Section */}
          <div className="flex items-center justify-end p-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                ref={showAllCheckboxRef}
                checked={areAllColumnsShown}
                onCheckedChange={toggleShowAllColumns}
                id="show-all"
                className="h-4 w-4"
              />
              <label
                htmlFor="show-all"
                className="text-sm font-medium cursor-pointer select-none"
                onClick={() => toggleShowAllColumns(!areAllColumnsShown)}
              >
                Show All
              </label>
            </div>
          </div>

          {/* Columns List */}
          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-[300px] overflow-y-auto">
              {filteredColumns.length > 0 ? (
                <div className="grid grid-cols-2 divide-y divide-x-0">
                  {filteredColumns.map(([key, value]) => (
                    <div
                      key={key}
                      className={cn(
                        "flex items-center space-x-2 px-3 py-2.5 hover:bg-accent/50 transition-colors cursor-pointer",
                        value.visibility && "bg-accent/30"
                      )}
                      onClick={() => toggleShowColumn(key)}
                    >
                      <Checkbox
                        id={key}
                        checked={value.visibility}
                        onCheckedChange={() => toggleShowColumn(key)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4"
                      />
                      <label
                        htmlFor={key}
                        className={cn(
                          "text-sm font-medium cursor-pointer select-none flex-1",
                          value.visibility ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {value.name}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No columns found matching "{searchQuery}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            type="button"
          >
            Cancel
          </Button>
          <Button onClick={handleApply} type="button">
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

