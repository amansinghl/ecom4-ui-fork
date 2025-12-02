"use client";

import { ColumnDef } from "@tanstack/react-table";
import { type CodTransactionType } from "@/types/cod-transactions";
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
  CreditCard,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { copyToClipBoard } from "@/lib/client_utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

const getCodStatusVariant = (status: string | undefined) => {
  if (!status) return "outline";

  switch (status.toLowerCase()) {
    case "received":
      return "default";
    case "pending":
      return "secondary";
    case "processing":
      return "outline";
    case "failed":
      return "destructive";
    default:
      return "outline";
  }
};

const getCodStatusIcon = (status: string | undefined) => {
  if (!status) return <Clock className="size-4 text-gray-600" />;

  switch (status.toLowerCase()) {
    case "received":
      return <CheckCircle className="size-4 text-green-600" />;
    case "pending":
      return <Clock className="size-4 text-yellow-600" />;
    case "processing":
      return <AlertCircle className="size-4 text-blue-600" />;
    case "failed":
      return <AlertCircle className="size-4 text-red-600" />;
    default:
      return <Clock className="size-4 text-gray-600" />;
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

export const columns: ColumnDef<CodTransactionType>[] = [
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
    accessorKey: "cod_amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="COD Amount" />
    ),
    cell: ({ row }) => {
      return (
        <div className="space-y-1">
          <div className="text-sm font-semibold text-primary">
            {formatCurrency(row.original.cod_amount)}
          </div>
          <div className="text-muted-foreground text-xs">
            Paid: {formatCurrency(row.original.paid_amount)}
          </div>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "cod_status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="COD Status" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          {getCodStatusIcon(row.original.cod_status)}
          <Badge
            variant={getCodStatusVariant(row.original.cod_status)}
            className="text-xs"
          >
            {row.original.cod_status || "N/A"}
          </Badge>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "payment_mode",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payment Mode" />
    ),
    cell: ({ row }) => {
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <CreditCard className="size-3 text-muted-foreground" />
            <span>{row.original.payment_mode || "N/A"}</span>
          </div>
          {row.original.payment_ref_no && (
            <div className="text-muted-foreground text-xs font-mono">
              {row.original.payment_ref_no}
            </div>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "payment_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payment Date" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1 text-sm">
          <Calendar className="size-3 text-muted-foreground" />
          <span>{formatDate(row.original.payment_date)}</span>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "delivered_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Delivered Date" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1 text-sm">
          <Package className="size-3 text-muted-foreground" />
          <span>{formatDate(row.original.delivered_date)}</span>
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
    accessorKey: "cod_aging",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="COD Aging" />
    ),
    cell: ({ row }) => {
      const aging = row.original.cod_aging;
      const isHighAging = aging > 30;
      return (
        <div className="flex items-center gap-1 text-sm">
          <Clock className={`size-3 ${isHighAging ? "text-red-600" : "text-muted-foreground"}`} />
          <span className={isHighAging ? "font-semibold text-red-600" : ""}>
            {aging} days
          </span>
        </div>
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

