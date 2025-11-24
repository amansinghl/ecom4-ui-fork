"use client";

import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<{ header: string }>[] = [
  {
    header: "Shipment No.",
  },
  {
    header: "Seller",
  },
  {
    header: "Consignee",
  },
  {
    header: "Locations",
  },
  {
    header: "Tracking Status",
  },
  {
    header: "Shipment Date",
  },
  {
    header: "Payment Mode",
  },
  {
    header: "Product Description",
  },
  {
    header: "Weight",
  },
];
