"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ShipmentType } from "@/types/shipments";
import Image from "next/image";

export const columns: ColumnDef<ShipmentType>[] = [
  {
    accessorKey: "shipment_no",
    header: "Shipment No.",
  },
  {
    accessorKey: "tracking_id",
    header: "AWB Number",
  },
  {
    accessorKey: "supplier_name",
    header: "Supplier Name",
  },
  {
    accessorKey: "shipment_date",
    header: "Shipment Date",
  },
  {
    accessorKey: "from_pincode",
    header: "Origin Pincode",
  },
  {
    accessorKey: "to_pincode",
    header: "Destination Pincode",
  },
  {
    accessorKey: "partner_logo",
    header: "Partner",
    cell: ({ row }) => {
      const url =
        "https://ecom.vamaship.com/images/partners/logos/" +
        row.original.partner_logo;
      return <Image src={url} className="bg-amber-50 rounded-md" alt="Thumbnail" width={100} height={100} />;
    },
  },
];
