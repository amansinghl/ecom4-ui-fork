"use client";

import { ColumnDef } from "@tanstack/react-table";
import { type WeightDisputeType } from "@/types/weights";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Copy,
  Calendar,
  Package,
  Weight,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import { copyToClipBoard } from "@/lib/client_utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

const getDisputeStatusVariant = (status: string | null | undefined) => {
  if (!status) return "outline";

  switch (status.toLowerCase()) {
    case "settled":
      return "default";
    case "pending":
      return "secondary";
    case "rejected":
      return "destructive";
    case "approved":
      return "default";
    default:
      return "outline";
  }
};

const formatCurrency = (amount: string | null | undefined) => {
  if (!amount) return "₹0.00";
  const numAmount = parseFloat(amount);
  return `₹${numAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

const formatWeight = (weight: number | string | null | undefined) => {
  if (weight === null || weight === undefined) return "N/A";
  return `${weight} kg`;
};

export const columns: ColumnDef<WeightDisputeType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "shipment_no",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Shipment No" />
    ),
    cell: ({ row }) => {
      return (
        <div className="group hover:bg-muted/50 cursor-pointer space-y-1 rounded-md p-2 transition-colors">
          <div className="text-primary group-hover:text-primary/80 font-mono text-sm font-semibold transition-colors">
            {row.original.shipment_no || "N/A"}
          </div>
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <span className="font-mono">{row.original.awb_no || "N/A"}</span>
            {row.original.awb_no && (
              <Copy
                onClick={() => copyToClipBoard(row.original.awb_no ?? "")}
                className="cursor-pointer"
                size={11}
              />
            )}
          </div>
          {row.original.reference1 && (
            <div className="text-muted-foreground text-xs">
              Ref: {row.original.reference1}
            </div>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "weight_comparison",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Weight Comparison" />
    ),
    cell: ({ row }) => {
      const bookedWeight = parseFloat(row.original.booked_weight || "0");
      const invoiceWeight = row.original.invoice_weight || 0;
      const difference = invoiceWeight - bookedWeight;
      const isDisputed = difference > 0;

      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Weight className="size-3 text-muted-foreground" />
            <span className="font-semibold">Booked:</span>
            <span>{formatWeight(bookedWeight)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Package className="size-3 text-muted-foreground" />
            <span className="font-semibold">Invoice:</span>
            <span className={isDisputed ? "text-red-600 font-semibold" : ""}>
              {formatWeight(invoiceWeight)}
            </span>
          </div>
          {isDisputed && (
            <div className="text-xs text-red-600 font-semibold">
              Difference: +{difference.toFixed(2)} kg
            </div>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "weight_charge",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Weight Charge" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-sm font-semibold text-primary">
          {formatCurrency(row.original.weight_charge)}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "dispute_status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Dispute Status" />
    ),
    cell: ({ row }) => {
      const status = row.original.dispute_status;
      return (
        <div className="flex items-center gap-2">
          {status ? (
            <>
              {status.toLowerCase() === "settled" || status.toLowerCase() === "approved" ? (
                <CheckCircle className="size-4 text-green-600" />
              ) : status.toLowerCase() === "rejected" ? (
                <AlertCircle className="size-4 text-red-600" />
              ) : (
                <Clock className="size-4 text-yellow-600" />
              )}
              <Badge
                variant={getDisputeStatusVariant(status)}
                className="text-xs"
              >
                {status}
              </Badge>
            </>
          ) : (
            <Badge variant="outline" className="text-xs">
              Not Disputed
            </Badge>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "disputed_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Disputed At" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1 text-sm">
          <Calendar className="size-3 text-muted-foreground" />
          <span>{formatDate(row.original.disputed_at)}</span>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "shipment_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Shipment Date" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1 text-sm">
          <Calendar className="size-3 text-muted-foreground" />
          <span>{formatDate(row.original.shipment_date)}</span>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "product",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product" />
    ),
    cell: ({ row }) => {
      return (
        <div className="space-y-1">
          <div className="text-sm font-medium">{row.original.product || "N/A"}</div>
          <div className="text-muted-foreground text-xs">
            Value: {formatCurrency(row.original.product_value)}
          </div>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "sorter_links",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sorter Image" />
    ),
    cell: ({ row }) => {
      if (!row.original.sorter_links) {
        return <div className="text-sm text-muted-foreground">N/A</div>;
      }
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8"
                onClick={() => window.open(row.original.sorter_links || "", "_blank")}
              >
                <ExternalLink className="size-4 mr-1" />
                View
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open sorter image</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "supplier_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Supplier ID" />
    ),
    cell: ({ row }) => {
      return <div className="text-sm">{row.original.supplier_id}</div>;
    },
    enableSorting: false,
  },
];

