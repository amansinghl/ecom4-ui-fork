"use client";

import { ColumnDef } from "@tanstack/react-table";
import { type PackageType } from "@/types/packages";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Edit,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const columns: ColumnDef<PackageType>[] = [
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
    accessorKey: "package_identifier",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Package Identifier" />
    ),
    cell: ({ row }) => {
      return (
        <div className="group hover:bg-muted/50 cursor-pointer space-y-1 rounded-md p-2 transition-colors">
          <div className="text-primary group-hover:text-primary/80 font-semibold text-sm transition-colors">
            {row.original.package_identifier || "N/A"}
          </div>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "dimensions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Dimensions" />
    ),
    cell: ({ row }) => {
      const length = row.original.length;
      const breadth = row.original.breadth;
      const height = row.original.height;
      const unit = row.original.unit || "cm";
      
      if (length && breadth && height) {
        return (
          <div className="text-sm">
            {length} × {breadth} × {height} {unit}
          </div>
        );
      }
      return <div className="text-sm text-muted-foreground">N/A</div>;
    },
    enableSorting: false,
  },
  {
    accessorKey: "length",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Length" />
    ),
    cell: ({ row }) => {
      const length = row.original.length;
      const unit = row.original.unit || "cm";
      return (
        <div className="text-sm">
          {length !== null && length !== undefined
            ? `${length} ${unit}`
            : "N/A"}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "breadth",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Breadth" />
    ),
    cell: ({ row }) => {
      const breadth = row.original.breadth;
      const unit = row.original.unit || "cm";
      return (
        <div className="text-sm">
          {breadth !== null && breadth !== undefined
            ? `${breadth} ${unit}`
            : "N/A"}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "height",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Height" />
    ),
    cell: ({ row }) => {
      const height = row.original.height;
      const unit = row.original.unit || "cm";
      return (
        <div className="text-sm">
          {height !== null && height !== undefined
            ? `${height} ${unit}`
            : "N/A"}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "default_package",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Default Package" />
    ),
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        onMakeDefault?: (pkg: PackageType) => void;
      };
      
      const isDefault = row.original.default_package;
      const isDefaultBool = 
        isDefault === true || 
        isDefault === 1 || 
        isDefault === "1" || 
        String(isDefault).toLowerCase() === "true";
      
      return (
        <div className="text-sm">
          {isDefaultBool ? (
            <span className="text-green-600 dark:text-green-500 font-medium">Default</span>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => meta?.onMakeDefault?.(row.original)}
              className="text-xs"
            >
              Make Default
            </Button>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        onEdit?: (pkg: PackageType) => void;
      };

      const editIconClass = "h-4 w-4 text-blue-600 dark:text-blue-400";

      return (
        <div className="flex items-center justify-end gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                  onClick={() => meta?.onEdit?.(row.original)}
                >
                  <Edit className={editIconClass} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
    enableSorting: false,
  },
];

