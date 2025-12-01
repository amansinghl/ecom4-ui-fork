"use client";

import { ColumnDef } from "@tanstack/react-table";
import { type LocationType } from "@/types/locations";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Copy,
  Phone,
  MapPin,
  Mail,
  Trash2,
  Edit,
} from "lucide-react";
import { copyToClipBoard } from "@/lib/client_utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const columns: ColumnDef<LocationType>[] = [
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
    accessorKey: "location_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Location Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="group hover:bg-muted/50 cursor-pointer space-y-1 rounded-md p-2 transition-colors">
          <div className="text-primary group-hover:text-primary/80 font-semibold text-sm transition-colors">
            {row.original.location_name || "N/A"}
          </div>
          {row.original.location_type && (
            <div className="text-muted-foreground text-xs">
              <Badge variant="outline" className="text-xs">
                {row.original.location_type}
              </Badge>
            </div>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Location ID" />
    ),
    cell: ({ row }) => {
      return <div className="text-sm">{row.original.id}</div>;
    },
    enableSorting: false,
  },
  {
    accessorKey: "contact",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contact" />
    ),
    cell: ({ row }) => {
      const hasContact = row.original.full_name || row.original.contact || row.original.email;
      return (
        <div className="space-y-2">
          {row.original.full_name && (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs font-semibold">
                  {row.original.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="text-sm font-medium">
                  {row.original.full_name}
                </div>
                {row.original.contact && (
                  <div className="text-muted-foreground flex items-center gap-1 text-xs">
                    <Phone className="size-3" />
                    {row.original.calling_code && `${row.original.calling_code} `}
                    {row.original.contact}
                    <Copy
                      onClick={() =>
                        copyToClipBoard(row.original.contact ?? "")
                      }
                      className="cursor-pointer"
                      size={11}
                    />
                  </div>
                )}
                {row.original.email && (
                  <div className="text-muted-foreground flex items-center gap-1 text-xs">
                    <Mail className="size-3" />
                    {row.original.email}
                    <Copy
                      onClick={() =>
                        copyToClipBoard(row.original.email ?? "")
                      }
                      className="cursor-pointer"
                      size={11}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          {!hasContact && (
            <div className="text-muted-foreground text-xs">No contact info</div>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Address" />
    ),
    cell: ({ row }) => {
      const addressParts = [
        row.original.address_line_1,
        row.original.address_line_2,
        row.original.landmark,
      ].filter(Boolean);
      const address = addressParts.join(", ") || "N/A";

      return (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <MapPin className="size-3 text-muted-foreground" />
            <span>{address}</span>
          </div>
          <div className="text-muted-foreground text-xs pl-4">
            {row.original.city && row.original.state
              ? `${row.original.city}, ${row.original.state}`
              : row.original.city || row.original.state || ""}
            {row.original.pincode && ` - ${row.original.pincode}`}
            {row.original.country && `, ${row.original.country}`}
          </div>
        </div>
      );
    },
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
        onEdit?: (location: LocationType) => void;
        onDelete?: (location: LocationType) => void;
      };

      const canEdit = !row.original.channel_name || ["Vamaship", "Shopify"].includes(row.original.channel_name);
      const canDelete = row.original.channel_name !== "Shopify";

      const editIconClass = "h-4 w-4 text-blue-600 dark:text-blue-400";
      const deleteIconClass = canDelete ? "h-4 w-4 text-red-600 dark:text-red-400" : "h-4 w-4 text-muted-foreground";

      return (
        <div className="flex items-center justify-end gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                  onClick={() => {
                    if (!canEdit) {
                      toast.error("Kindly edit this location on its associated channel.");
                      return;
                    }
                    meta?.onEdit?.(row.original);
                  }}
                >
                  <Edit className={editIconClass} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-red-50 dark:hover:bg-red-950/30"
                    disabled={!canDelete}
                    onClick={() => meta?.onDelete?.(row.original)}
                  >
                    <Trash2 className={deleteIconClass} />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>{canDelete ? "Delete" : "Delete disabled for Shopify"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
    enableSorting: false,
  },
];

