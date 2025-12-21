"use client";

import { Params } from "next/dist/server/request/params";
import { toast } from "sonner";

export function copyToClipBoard(
  textToCopy: string,
  fieldName: string | null = null,
) {
  navigator.clipboard
    .writeText(textToCopy)
    .then(() => {
      const message = fieldName
        ? fieldName + " copied to clipboard"
        : "Copied to clipboard";
      toast.success(message);
    })
    .catch(() => {
      toast.error("Failed to copy!");
    });
}

export function getPageHeaderWithPathName(pathName: string, params: Params) {
  pathName = pathName.replace("/", "");
  const pathMapping: { [key: string]: string } = {
    "shipments": "Shipments",
    "shipments/rto": "RTO Shipments",
    "quick-ship": "Quick Ship",
    "dashboard": "Dashboard",
    "orders/manage-orders": "Manage Orders",
    "orders/bulk": "Bulk Booking",
    "catalogs/address-book": "Address Book",
    "catalogs/products": "Products",
    "catalogs/packages": "Packages",
  };
  if (pathMapping?.[pathName]) {
    return pathMapping?.[pathName];
  }
  pathName = pathName.split("/")[0];
  return pathMapping?.[pathName] ?? "Unknown";
}
