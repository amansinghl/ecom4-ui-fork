"use client";

import { ColumnDef } from "@tanstack/react-table";
import { type CodTransactionType } from "@/types/cod-transactions";
import { type PartnerType } from "@/api/masters";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import {
  Copy,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { copyToClipBoard } from "@/lib/client_utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";

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
    case "cod cancelled":
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
    case "cod cancelled":
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
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
};

// Helper function to construct full logo URL
const getLogoUrl = (logo: string | undefined): string | undefined => {
  if (!logo) return undefined;
  
  // If logo is already a full URL, return as is
  if (logo.startsWith("http://") || logo.startsWith("https://")) {
    return logo;
  }
  
  // If logo is a relative path, construct full URL
  // Try to get base URL from environment or construct from API base URL
  const apiBaseUrl = process.env.NEXT_PUBLIC_ECOM3_API_BASE_URL || "";
  let baseUrl = apiBaseUrl.replace("/api/v1/", "").replace("/api/v1", "");
  
  // Remove trailing slash from baseUrl
  baseUrl = baseUrl.replace(/\/$/, "");
  
  // Handle relative paths
  if (logo.startsWith("/")) {
    return `${baseUrl}${logo}`;
  }
  return `${baseUrl}/${logo}`;
};

// Helper functions to get partner info from supplier_id
const getPartnerLogo = (
  supplierId: number | undefined,
  partners: PartnerType[] | undefined,
): string | undefined => {
  if (!supplierId || !partners) return undefined;
  const partner = partners.find((p) => p.partner_id === supplierId);
  return getLogoUrl(partner?.logo);
};

const getPartnerName = (
  supplierId: number | undefined,
  partners: PartnerType[] | undefined,
): string => {
  if (!supplierId || !partners) return "";
  const partner = partners.find((p) => p.partner_id === supplierId);
  return partner?.name || "";
};

// Partner Logo Component with error handling
const PartnerLogo = ({ 
  src, 
  alt 
}: { 
  src: string | undefined; 
  alt: string;
}) => {
  const [imageError, setImageError] = useState(false);
  
  if (!src || imageError) return null;
  
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="h-6 w-6 object-contain rounded-full"
      onError={() => setImageError(true)}
    />
  );
};

export const createColumns = (
  partners: PartnerType[] | undefined,
): ColumnDef<CodTransactionType>[] => [
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
      <DataTableColumnHeader column={column} title="Shipment No." />
    ),
    cell: ({ row }) => {
      return (
        <div className="font-mono text-sm font-semibold">
          {row.original.shipment_no || ""}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "awb_no",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="AWB" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">{row.original.awb_no || ""}</span>
          {row.original.awb_no && (
            <Copy
              onClick={() => copyToClipBoard(row.original.awb_no ?? "")}
              className="cursor-pointer size-3 text-muted-foreground hover:text-foreground"
            />
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "supplier_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Partner" />
    ),
    cell: ({ row }) => {
      const supplierId = row.original.supplier_id;
      const partnerLogo = getPartnerLogo(supplierId, partners);
      const partnerName = getPartnerName(supplierId, partners);
      
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <PartnerLogo src={partnerLogo} alt={partnerName} />
                {partnerName && (
                  <span className="text-sm">{partnerName}</span>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{partnerName}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "tracking_status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tracking Status" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-sm">
          {row.original.tracking_status || ""}
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
    cell: ({ row }) => {
      return (
        <div className="text-sm">
          {formatDate(row.original.shipment_date)}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "delivered_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Delivered On" />
    ),
    cell: ({ row }) => {
      const deliveredDate = formatDate(row.original.delivered_date);
      const codAging = row.original.cod_aging;
      const isUnpaid = row.original.cod_status?.toLowerCase() !== "received";
      
      return (
        <div className="space-y-1">
          <div className="text-sm">{deliveredDate}</div>
          {isUnpaid && codAging > 0 && (
            <div className="text-xs text-muted-foreground">
              Unpaid {codAging} days
            </div>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "reference1",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Reference1" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-sm">
          {row.original.reference1 || ""}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "cod_amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="COD Value" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-sm font-semibold">
          {formatCurrency(row.original.cod_amount)}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "paid_amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="COD Paid" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-sm">
          {formatCurrency(row.original.paid_amount)}
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
            {row.original.cod_status || ""}
          </Badge>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "cod_aging",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Paid in (days)" />
    ),
    cell: ({ row }) => {
      const aging = row.original.cod_aging;
      const isPaid = row.original.cod_status?.toLowerCase() === "received";
      
      if (isPaid && aging > 0) {
        return (
          <div className="text-sm">
            {aging}
          </div>
        );
      }
      
      return (
        <div className="text-sm text-muted-foreground">
          {aging > 0 ? aging : ""}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "payment_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Paid On" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-sm">
          {formatDate(row.original.payment_date)}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "payment_ref_no",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="UTR No." />
    ),
    cell: ({ row }) => {
      return (
        <div className="font-mono text-sm">
          {row.original.payment_ref_no || ""}
        </div>
      );
    },
    enableSorting: false,
  },
];

// Export default columns for backward compatibility (without partners)
export const columns = createColumns(undefined);
