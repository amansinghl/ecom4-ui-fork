"use client";

import { ColumnDef } from "@tanstack/react-table";
import { type ProductType } from "@/types/products";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Trash2,
  Edit,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const columns: ColumnDef<ProductType>[] = [
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
    accessorKey: "product_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="group hover:bg-muted/50 cursor-pointer space-y-1 rounded-md p-2 transition-colors">
          <div className="text-primary group-hover:text-primary/80 font-semibold text-sm transition-colors">
            {row.original.product_name || "N/A"}
          </div>
          {row.original.sku && (
            <div className="text-muted-foreground text-xs">
              SKU: {row.original.sku}
            </div>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "product_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.product_type ? (
          <Badge variant="secondary" className="text-xs">
            {row.original.product_type}
          </Badge>
        ) : (
          "N/A"
        )}
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
    cell: ({ row }) => {
      const price = row.original.price;
      const currency = row.original.currency || "";
      return (
        <div className="text-sm">
          {price !== null && price !== undefined
            ? `${currency} ${price}`
            : "N/A"}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "weight",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Weight" />
    ),
    cell: ({ row }) => {
      const weight = row.original.weight || row.original.weight_in_kgs;
      const unit = row.original.weight_unit || "kgs";
      return (
        <div className="text-sm">
          {weight !== null && weight !== undefined
            ? `${weight} ${unit}`
            : "N/A"}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "hsn_code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="HSN Code" />
    ),
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.hsn_code !== null && row.original.hsn_code !== undefined
          ? String(row.original.hsn_code)
          : "N/A"}
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "channel_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Channel" />
    ),
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.channel_name ? (
          <Badge variant="secondary" className="text-xs">
            {row.original.channel_name}
          </Badge>
        ) : (
          "N/A"
        )}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        onEdit?: (product: ProductType) => void;
        onDelete?: (product: ProductType) => void;
      };

      const isVamaship = row.original.channel_name === "Vamaship";
      const canEdit = isVamaship;
      const canDelete = isVamaship;

      const editIconClass = canEdit
        ? "h-4 w-4 text-blue-600 dark:text-blue-400"
        : "h-4 w-4 text-muted-foreground";
      const deleteIconClass = canDelete
        ? "h-4 w-4 text-red-600 dark:text-red-400"
        : "h-4 w-4 text-muted-foreground";

      return (
        <div className="flex items-center justify-end gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8",
                      canEdit
                        ? "hover:bg-blue-50 dark:hover:bg-blue-950/30"
                        : "cursor-not-allowed opacity-50",
                    )}
                    disabled={!canEdit}
                    onClick={() => {
                      if (!canEdit) {
                        return;
                      }
                      meta?.onEdit?.(row.original);
                    }}
                  >
                    <Edit className={editIconClass} />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {canEdit
                  ? "Edit"
                  : `Edit product on ${row.original.channel_name || "respective"} channel only`}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8",
                      canDelete
                        ? "hover:bg-red-50 dark:hover:bg-red-950/30"
                        : "cursor-not-allowed opacity-50",
                    )}
                    disabled={!canDelete}
                    onClick={() => meta?.onDelete?.(row.original)}
                  >
                    <Trash2 className={deleteIconClass} />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {canDelete
                  ? "Delete"
                  : `Delete product on ${row.original.channel_name || "respective"} channel only`}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
    enableSorting: false,
  },
];

