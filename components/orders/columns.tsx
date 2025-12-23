"use client";

import { ColumnDef } from "@tanstack/react-table";
import { type OrderType, type DefaultPackageType } from "@/types/orders";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  Copy,
  Phone,
  MapPin,
  Calendar,
  Package,
  Box,
  CreditCard,
  Edit,
  Trash2,
} from "lucide-react";
import { copyToClipBoard } from "@/lib/client_utils";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { getPaymentModeColor } from "../shipments/utils";
import { OrderStatusBadge } from "./utils";

export const createColumns = (
  defaultPackage: DefaultPackageType | null,
  serviceableOrderIds: Set<number> = new Set(),
  hasOriginLocation: boolean = false,
  onOrderClick?: (order: OrderType) => void
): ColumnDef<OrderType>[] => [
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
    id: "order_info",
    accessorFn: (row) => `${row.id}-${row.reference1}-${row.order_date}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order Info" />
    ),
    cell: ({ row }) => {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className="group hover:bg-muted/50 cursor-pointer space-y-1 rounded-md p-2 transition-colors"
                onClick={(e) => {
                  // Don't trigger if clicking on the copy button
                  if ((e.target as HTMLElement).closest('svg') || (e.target as HTMLElement).closest('button')) {
                    return;
                  }
                  onOrderClick?.(row.original);
                }}
              >
                <div className="text-primary group-hover:text-primary/80 font-mono text-sm font-semibold transition-colors">
                  Ref: {row.original.id || "N/A"}
                </div>
                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                  <span className="font-mono">
                    {row.original.reference1 || "N/A"}
                  </span>
                  {row.original.reference1 && (
                    <Copy
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipBoard(row.original?.reference1 ?? "");
                      }}
                      className="cursor-pointer"
                      size={11}
                    />
                  )}
                </div>
                <div className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Calendar className="size-3" />
                  {row.original.order_date
                    ? new Date(row.original.order_date).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : "N/A"}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Click to view order details</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const dateA = rowA.original.order_date
        ? new Date(rowA.original.order_date).getTime()
        : 0;
      const dateB = rowB.original.order_date
        ? new Date(rowB.original.order_date).getTime()
        : 0;
      return dateA - dateB;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.original.status || undefined;
      return <OrderStatusBadge status={status} />;
    },
    enableSorting: true,
    filterFn: (row, id, value) => {
      const status = (row.original.status || "").toLowerCase();
      return Array.isArray(value) ? value.some((v: string) => status.includes(v.toLowerCase())) : false;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    // TODO: Implement edit functionality
                    console.log("Edit order", row.original.id);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit order</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  onClick={() => {
                    // TODO: Implement delete functionality
                    console.log("Delete order", row.original.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete order</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    id: "weight_dimensions",
    accessorFn: (row) => `${row.weight_in_kgs}-${row.dimensions || (defaultPackage ? `${defaultPackage.length}x${defaultPackage.breadth}x${defaultPackage.height}` : "")}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Weight & Dimensions" />
    ),
    cell: ({ row }) => {
      const weight = row.original.weight_in_kgs;
      
      // Use order's dimensions if available, otherwise fall back to defaultPackage
      const dimensions = row.original.dimensions 
        ? row.original.dimensions
        : defaultPackage
          ? `${defaultPackage.length} x ${defaultPackage.breadth} x ${defaultPackage.height} ${defaultPackage.unit}`
          : null;
      
      // Calculate volumetric weight from dimensions string
      const calculateVolumetricWeight = (dims: string | null): number | null => {
        if (!dims) return null;
        
        const parts = dims.trim().split(/\s*x\s*/i);
        if (parts.length >= 3) {
          const l = parseFloat(parts[0]);
          const b = parseFloat(parts[1]);
          const h = parseFloat(parts[2]);
          const unitStr = parts[3]?.toLowerCase() || dims.toLowerCase();
          const isInch = unitStr.includes("inch");
          
          if (!isNaN(l) && !isNaN(b) && !isNaN(h) && l > 0 && b > 0 && h > 0) {
            const volume = l * b * h;
            // Formula: (L × B × H) / 5000 for cm, or (L × B × H) / 305 for inch
            const divisor = isInch ? 305 : 5000;
            return Math.round((volume / divisor) * 100) / 100;
          }
        }
        return null;
      };
      
      const volumetricWeight = calculateVolumetricWeight(dimensions);

      return (
        <div className="space-y-1">
          <div className="text-sm font-medium">
            {weight ? `${weight} kg` : "N/A"}
          </div>
          {dimensions && (
            <div className="text-muted-foreground text-xs">
              {dimensions}
            </div>
          )}
          {volumetricWeight && (
            <div className="text-muted-foreground text-xs">
              Vol. Weight: {volumetricWeight.toFixed(2)} kg
            </div>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "payment_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payment Mode" />
    ),
    cell: ({ row }) => {
      const paymentType = row.original.payment_type || "N/A";
      const isCod = paymentType.toLowerCase() === "cod" || paymentType.toLowerCase() === "cash on delivery";
      return (
        <Badge
          variant={isCod ? "default" : "secondary"}
          className={`text-xs font-medium flex items-center gap-1.5 w-fit ${
            isCod
              ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
              : "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
          }`}
        >
          {isCod ? (
            <>
              <Box className="h-3.5 w-3.5" />
              COD
            </>
          ) : (
            <>
              <CreditCard className="h-3.5 w-3.5" />
              Prepaid
            </>
          )}
        </Badge>
      );
    },
    enableSorting: false,
    filterFn: (row, id, value) => {
      const paymentType = (row.original.payment_type || "").toLowerCase();
      return value.some((v: string) => paymentType.includes(v.toLowerCase()));
    },
  },
  {
    accessorKey: "serviceability",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Serviceability" />
    ),
    cell: ({ row }) => {
      const orderId = row.original.id;
      const isServiceable = serviceableOrderIds.has(orderId);
      
      if (!hasOriginLocation) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="text-xs cursor-help">
                  N/A
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Choose origin location</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }
      
      return (
        <Badge
          className={`text-xs font-medium ${
            isServiceable
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {isServiceable ? "Serviceable" : "Not Serviceable"}
        </Badge>
      );
    },
    enableSorting: false,
    filterFn: (row, id, value) => {
      if (!hasOriginLocation) {
        return value.includes("na");
      }
      const orderId = row.original.id;
      const isServiceable = serviceableOrderIds.has(orderId);
      return value.includes(isServiceable ? "serviceable" : "not_serviceable");
    },
  },
  {
    id: "customer",
    accessorFn: (row) => {
      const addressParts = [
        row.city,
        row.dest_state,
        row.dest_pincode,
        row.dest_country,
      ].filter(Boolean);
      return `${row.dest_full_name}-${row.dest_contact}-${addressParts.join(", ")}`;
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Customer" />
    ),
    cell: ({ row }) => {
      // Construct address from dest.* fields and city
      const addressParts = [
        row.original.city,
        row.original.dest_state,
        row.original.dest_pincode,
        row.original.dest_country,
      ].filter(Boolean);
      const fullAddress = addressParts.join(", ");
      
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="space-y-2 max-w-[150px]">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="text-xs font-semibold">
                      {row.original.dest_full_name
                        ? row.original.dest_full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                        : "N/A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">
                      {row.original.dest_full_name || "Unknown Customer"}
                    </div>
                    <div className="text-muted-foreground flex items-center gap-1 text-xs">
                      <Phone className="size-3 shrink-0" />
                      <span className="truncate">{row.original.dest_contact || "N/A"}</span>
                      {row.original?.dest_contact && (
                        <Copy
                          onClick={() =>
                            copyToClipBoard(row.original?.dest_contact ?? "")
                          }
                          className="cursor-pointer shrink-0"
                          size={11}
                        />
                      )}
                    </div>
                  </div>
                </div>
                {fullAddress && (
                  <div className="text-muted-foreground flex items-start gap-1 text-xs pl-10">
                    <MapPin className="size-3 mt-0.5 shrink-0" />
                    <span className="line-clamp-3 break-words">{fullAddress}</span>
                  </div>
                )}
              </div>
            </TooltipTrigger>
            {fullAddress && (
              <TooltipContent className="max-w-md">
                <p className="break-words">{fullAddress}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
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
      <Badge variant="secondary" className="text-xs">
        {row.original.channel_name || "Unknown"}
      </Badge>
    ),
    enableSorting: false,
    filterFn: (row, id, value) => {
      const channel = (row.original.channel_name || "").toLowerCase();
      return value.some((v: string) => channel.includes(v.toLowerCase()));
    },
  },
  {
    accessorKey: "product",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product" />
    ),
    cell: ({ row }) => {
      const productName = row.original.product || "Unknown";
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[150px]">
                <Badge variant="outline" className="text-xs w-full">
                  <Package className="mr-1 size-3 shrink-0" />
                  <span className="truncate block">{productName}</span>
                </Badge>
              </div>
            </TooltipTrigger>
            {productName.length > 20 && (
              <TooltipContent>
                <p>{productName}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "tags",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tags" />
    ),
    cell: ({ row }) => {
      const tags = row.original.tags;
      if (!tags) return <span className="text-muted-foreground text-xs">N/A</span>;
      return (
        <Badge variant="outline" className="text-xs">
          {tags}
        </Badge>
      );
    },
    enableSorting: false,
  },
];
