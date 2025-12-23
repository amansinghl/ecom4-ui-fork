"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PaymentTransaction, LedgerTransaction } from "@/types/transactions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { format } from "date-fns";

// Format currency
const formatCurrency = (amount: string | null | undefined): string => {
  if (!amount) return "₹0.00";
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) return "₹0.00";
  return `₹${numAmount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Format date with ordinal
const formatDateWithOrdinal = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = format(date, "MMM");
    const year = format(date, "yyyy");
    const time = format(date, "hh:mm a");

    const getOrdinal = (n: number) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    return `${getOrdinal(day)} ${month} ${year} - ${time}`;
  } catch {
    return "";
  }
};

// Format transaction amount
const formatTransactionAmount = (row: PaymentTransaction): string => {
  if (row.credit_amount && parseFloat(row.credit_amount) !== 0) {
    return formatCurrency(row.credit_amount);
  } else if (row.debit_amount && parseFloat(row.debit_amount) !== 0) {
    return `- ${formatCurrency(row.debit_amount)}`;
  }
  return formatCurrency(row.transaction_amount);
};

export const paymentsColumns: ColumnDef<PaymentTransaction>[] = [
  {
    accessorKey: "transaction_date",
    header: "Date - Time",
    cell: ({ row }) => (
      <div className="text-sm">
        {formatDateWithOrdinal(row.original.transaction_date)}
      </div>
    ),
  },
  {
    accessorKey: "booking_email",
    header: "Email",
    cell: ({ row }) => (
      <div className="text-sm">{row.original.booking_email || ""}</div>
    ),
  },
  {
    accessorKey: "voucher_no",
    header: "Voucher No.",
    cell: ({ row }) => {
      if (!row.original.voucher_no) return "";

      const handleDownload = () => {
        const event = new CustomEvent("download-voucher", {
          detail: { voucherNo: row.original.voucher_no },
        });
        window.dispatchEvent(event);
      };

      return (
        <Button
          variant="link"
          className="h-auto p-0 font-mono text-sm"
          onClick={handleDownload}
        >
          <FileText className="mr-1 h-3 w-3" />
          {row.original.voucher_no}
        </Button>
      );
    },
  },
  {
    accessorKey: "transaction_amount",
    header: "Transaction Amount",
    cell: ({ row }) => (
      <div className="text-sm font-semibold">
        {formatTransactionAmount(row.original)}
      </div>
    ),
  },
  {
    accessorKey: "transaction_unique_id",
    header: "Unique Transaction id",
    cell: ({ row }) => (
      <div className="font-mono text-sm">
        {row.original.transaction_unique_id || ""}
      </div>
    ),
  },
  {
    accessorKey: "payment_mode",
    header: "Payment Mode",
    cell: ({ row }) => (
      <div className="text-sm">{row.original.payment_mode || ""}</div>
    ),
  },
  {
    accessorKey: "payment_status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.payment_status?.toLowerCase() === "success"
            ? "default"
            : "secondary"
        }
      >
        {row.original.payment_status || ""}
      </Badge>
    ),
  },
  {
    accessorKey: "remark",
    header: "Remark",
    cell: ({ row }) => (
      <div className="text-sm">{row.original.remark || ""}</div>
    ),
  },
];

export const ledgerColumns: ColumnDef<LedgerTransaction>[] = [
  {
    accessorKey: "transaction_date",
    header: "Transaction Date",
    cell: ({ row }) => (
      <div className="text-sm">
        {formatDateWithOrdinal(row.original.transaction_date)}
      </div>
    ),
  },
  {
    accessorKey: "shipment_no",
    header: "Shipment No",
    cell: ({ row }) => (
      <div className="font-mono text-sm font-semibold">
        {row.original.shipment_no || ""}
      </div>
    ),
  },
  {
    accessorKey: "voucher_no",
    header: "Voucher No.",
    cell: ({ row }) => {
      if (!row.original.voucher_no) return "";

      const handleDownload = () => {
        const event = new CustomEvent("download-ledger-voucher", {
          detail: { voucherNo: row.original.voucher_no },
        });
        window.dispatchEvent(event);
      };

      return (
        <Button
          variant="link"
          className="h-auto p-0 font-mono text-sm"
          onClick={handleDownload}
        >
          <FileText className="mr-1 h-3 w-3" />
          {row.original.voucher_no}
        </Button>
      );
    },
  },
  {
    accessorKey: "remark",
    header: "Remark",
    cell: ({ row }) => (
      <div className="text-sm">{row.original.remark || ""}</div>
    ),
  },
  {
    accessorKey: "accounting_type",
    header: "Accounting",
    cell: ({ row }) => {
      const isCredit =
        row.original.accounting_type?.toLowerCase() === "credit";
      const isDebit = row.original.accounting_type?.toLowerCase() === "debit";

      return (
        <Badge
          variant={
            isCredit ? "default" : isDebit ? "destructive" : "secondary"
          }
        >
          {row.original.accounting_type || ""}
        </Badge>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const isCredit =
        row.original.accounting_type?.toLowerCase() === "credit";
      const isDebit = row.original.accounting_type?.toLowerCase() === "debit";
      const amount = isCredit ? row.original.credit : row.original.debit;

      return (
        <div
          className={`text-sm font-semibold ${
            isCredit ? "text-green-600" : isDebit ? "text-red-600" : ""
          }`}
        >
          {isCredit ? "+" : "-"} {formatCurrency(amount)}
        </div>
      );
    },
  },
];

// Default column visibility for Payments
export const defaultPaymentsColumnVisibility = {
  transaction_date: {
    name: "Date - Time",
    visibility: true,
  },
  booking_email: {
    name: "Email",
    visibility: true,
  },
  voucher_no: {
    name: "Voucher No.",
    visibility: true,
  },
  transaction_amount: {
    name: "Transaction Amount",
    visibility: true,
  },
  transaction_unique_id: {
    name: "Unique Transaction id",
    visibility: true,
  },
  payment_mode: {
    name: "Payment Mode",
    visibility: true,
  },
  payment_status: {
    name: "Status",
    visibility: true,
  },
  remark: {
    name: "Remark",
    visibility: true,
  },
};

// Default column visibility for Ledger
export const defaultLedgerColumnVisibility = {
  transaction_date: {
    name: "Transaction Date",
    visibility: true,
  },
  shipment_no: {
    name: "Shipment No",
    visibility: true,
  },
  voucher_no: {
    name: "Voucher No.",
    visibility: true,
  },
  remark: {
    name: "Remark",
    visibility: true,
  },
  accounting_type: {
    name: "Accounting",
    visibility: true,
  },
  amount: {
    name: "Amount",
    visibility: true,
  },
};

