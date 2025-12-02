"use client";

import { ColumnDef } from "@tanstack/react-table";
import { type ShipmentType } from "@/types/shipments";
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
  Truck,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Package,
  Box,
  CreditCard,
} from "lucide-react";
import { copyToClipBoard } from "@/lib/client_utils";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";

const getStatusIcon = (status: string | undefined) => {
  if (!status) return <Clock className="size-4 text-gray-600" />;

  switch (status.toLowerCase()) {
    case "delivered":
      return <CheckCircle className="size-4 text-green-600" />;
    case "in transit":
      return <Truck className="size-4 text-blue-600" />;
    case "processing":
      return <Clock className="size-4 text-yellow-600" />;
    case "delayed":
      return <AlertCircle className="size-4 text-red-600" />;
    default:
      return <Clock className="size-4 text-gray-600" />;
  }
};

const getStatusVariant = (status: string | undefined) => {
  if (!status) return "outline";

  switch (status.toLowerCase()) {
    case "delivered":
      return "default";
    case "in transit":
      return "secondary";
    case "processing":
      return "outline";
    case "delayed":
      return "destructive";
    default:
      return "outline";
  }
};

const getPaymentModeColor = (isCod: boolean) => {
  return isCod ? "text-blue-600" : "text-green-600";
};

export const columns: ColumnDef<ShipmentType>[] = [
  {
    accessorKey: "shipment_no",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Shipment No" />
    ),
    cell: ({ row }) => {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="group hover:bg-muted/50 cursor-pointer space-y-1 rounded-md p-2 transition-colors">
                <div className="text-primary group-hover:text-primary/80 font-mono text-sm font-semibold transition-colors">
                  {row.original.shipment_no || "N/A"}
                </div>
                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                  <span className="font-mono">
                    {row.original.tracking_id || "N/A"}
                  </span>
                  {row.original.tracking_id && (
                    <Copy
                      onClick={() =>
                        copyToClipBoard(row.original?.tracking_id ?? "")
                      }
                      className="cursor-pointer"
                      size={11}
                    />
                  )}
                </div>
                <div className="text-muted-foreground text-xs">
                  Ref: {row.original.reference1 || "N/A"}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Click to view shipment details</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "consignee_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Customer" />
    ),
    cell: ({ row }) => (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs font-semibold">
              {row.original.consignee_name
                ? row.original.consignee_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                : "N/A"}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="text-sm font-medium">
              {row.original.consignee_name || "Unknown Customer"}
            </div>
            <div className="text-muted-foreground flex items-center gap-1 text-xs">
              <Phone className="size-3" />
              {row.original.consignee_contact || "N/A"}
              {row.original?.consignee_contact && (
                <Copy
                  onClick={() =>
                    copyToClipBoard(row.original?.consignee_contact)
                  }
                  className="cursor-pointer"
                  size={11}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "route",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Route" />
    ),
    cell: ({ row }) => {
      const origin = row.original.origin_city
        ? `${row.original.origin_city}${row.original.origin_state ? `, ${row.original.origin_state}` : ""}`
        : "Unknown Origin";
      const destination = row.original.destination_city
        ? `${row.original.destination_city}${row.original.destination_state ? `, ${row.original.destination_state}` : ""}`
        : "Unknown Destination";

      return (
        <div className="space-y-2">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm font-medium">
              <MapPin className="size-3 text-green-600" />
              {origin}
            </div>
            {row.original.from_pincode && (
              <div className="text-muted-foreground pl-4 text-xs">
                PIN: {row.original.from_pincode}
              </div>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm font-medium">
              <Truck className="size-3 text-blue-600" />
              {destination}
            </div>
            {row.original.destination_pincode && (
              <div className="text-muted-foreground pl-4 text-xs">
                PIN: {row.original.destination_pincode}
              </div>
            )}
          </div>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tracking Status" />
    ),
    cell: ({ row }) => {
      const status = row.original.tracking_status_message || undefined;
      return (
        <div className="flex items-center gap-2">
          {getStatusIcon(status)}
          <Badge
            variant={getStatusVariant(status)}
            className="text-xs font-medium"
          >
            {status || "Unknown"}
          </Badge>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "shipment_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Booked On" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-1 text-sm">
        <Calendar className="text-muted-foreground size-3" />
        {row.original.shipment_date
          ? new Date(row.original.shipment_date).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "N/A"}
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "product",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product" />
    ),
    cell: ({ row }) => {
      const paymentMode = row.original.cod_value ? "COD" : "Prepaid";
      const paymentColor = getPaymentModeColor(!!row.original.cod_value);

      return (
        <div className="space-y-1">
          <Badge variant="outline" className="text-xs max-w-36 text-ellipsis">
            <Package className="mr-1 size-3" />
            {row.original.product || "Unknown"}
          </Badge>
          {/* <div className={`text-xs font-medium ${paymentColor}`}>
            {paymentMode}
          </div> */}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "payment_modes",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payment Mode" />
    ),
    cell: ({ row }) => {
      const isCod = Number(row?.original?.cod_value ?? "0") > 0;
      return (
        <div className="flex flex-col">
          <div className="flex gap-1 items-center">
            {isCod ? (
              <Box color="purple" size={16} />
            ) : (
              <CreditCard color="green" size={16} />
            )}
            {isCod ? "COD" : "Prepaid"}
          </div>
          {isCod && (
            <div className="text-muted-foreground text-xs font-bold">
              Amt: {row?.original?.cod_value || "0.0"}
            </div>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "estimated_delivery_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estimated Delivery" />
    ),
    cell: ({ row }) => (
      <div className="text-sm">
        <div className="font-medium">
          {row.original.estimated_delivery_date
            ? new Date(row.original.estimated_delivery_date).toLocaleDateString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                },
              )
            : "N/A"}
        </div>
        <div className="text-muted-foreground text-xs">
          {row.original.estimated_delivery_date
            ? Math.ceil(
                (new Date(row.original.estimated_delivery_date).getTime() -
                  new Date().getTime()) /
                  (1000 * 60 * 60 * 24),
              )
            : 0}{" "}
          days
        </div>
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
      <Badge variant="secondary" className="text-xs">
        {row.original.channel_name || "Unknown"}
      </Badge>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "total_price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cost" />
    ),
    cell: ({ row }) => (
      <div className="text-sm font-semibold text-green-600">
        {row.original.total_price || "N/A"}
      </div>
    ),
    enableSorting: false,
  },
];
