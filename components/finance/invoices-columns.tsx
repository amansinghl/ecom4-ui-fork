"use client";

import { ColumnDef } from "@tanstack/react-table";
import { InvoiceType, PassbookTransactionType } from "@/types/invoices";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { cn } from "@/lib/utils";

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

// Format date
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return format(date, "dd MMM yyyy");
  } catch {
    return "";
  }
};

// Get month range for invoice
const getMonthRange = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const prevMonth = subMonths(date, 1);
    const start = startOfMonth(prevMonth);
    const end = endOfMonth(prevMonth);
    
    const getOrdinal = (n: number) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };
    
    const startStr = `${getOrdinal(start.getDate())} ${format(start, "MMM")}`;
    const endStr = `${getOrdinal(end.getDate())} ${format(end, "MMM")}`;
    
    return `${startStr} - ${endStr}`;
  } catch {
    return "";
  }
};

// Format month-year
const formatMonthYear = (monthYear: string): string => {
  try {
    const [year, month] = monthYear.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return format(date, "MMM - yyyy");
  } catch {
    return monthYear;
  }
};

export const invoicesColumns: ColumnDef<InvoiceType>[] = [
  {
    accessorKey: "invoice_no",
    header: "Invoice No.",
    cell: ({ row }) => {
      const handleDownload = () => {
        const event = new CustomEvent("download-invoice", {
          detail: { invoiceNumber: row.original.invoice_no },
        });
        window.dispatchEvent(event);
      };

      return (
        <Button
          variant="link"
          className="h-auto p-0 font-mono text-sm text-primary"
          onClick={handleDownload}
        >
          <FileText className="mr-1 h-3 w-3" />
          {row.original.invoice_no}
        </Button>
      );
    },
  },
  {
    accessorKey: "month_year",
    header: "Month-Year",
    cell: ({ row }) => (
      <div className="text-sm">{formatMonthYear(row.original.month_year)}</div>
    ),
  },
  {
    accessorKey: "invoice_date",
    header: "Invoice Date Range",
    cell: ({ row }) => (
      <div className="text-sm">{getMonthRange(row.original.invoice_date)}</div>
    ),
  },
  {
    accessorKey: "invoice_type",
    header: "Type",
    cell: ({ row }) => (
      <div className="text-sm">{row.original.invoice_type || ""}</div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <div className="text-sm">{row.original.category || ""}</div>
    ),
  },
  {
    accessorKey: "total",
    header: "Total Cost",
    cell: ({ row }) => (
      <div className="text-sm font-semibold">
        {formatCurrency(row.original.total)}
      </div>
    ),
  },
  {
    accessorKey: "paid",
    header: "Amount Paid",
    cell: ({ row }) => (
      <div className="text-sm">{formatCurrency(row.original.paid)}</div>
    ),
  },
  {
    accessorKey: "pending",
    header: "Pending Amount",
    cell: ({ row }) => (
      <div className="text-sm">{formatCurrency(row.original.pending)}</div>
    ),
  },
];

export const passbookColumns: ColumnDef<PassbookTransactionType>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = row.original.date;
      if (!date) return "";
      return <div className="text-sm">{formatDate(date)}</div>;
    },
  },
  {
    accessorKey: "remark",
    header: "Description",
    cell: ({ row }) => {
      const isBalanceRow = row.original.remark === "Opening Balance" || row.original.remark === "Closing Balance";
      return (
        <div className={cn(
          "text-sm",
          isBalanceRow ? "font-bold text-primary" : "font-medium"
        )}>
          {row.original.remark || ""}
        </div>
      );
    },
  },
  {
    accessorKey: "credit",
    header: "Credit",
    cell: ({ row }) => {
      const credit = parseFloat(row.original.credit || "0");
      if (credit === 0) return "";
      return (
        <div className="text-sm text-green-600 font-semibold">
          {formatCurrency(credit.toString())}
        </div>
      );
    },
  },
  {
    accessorKey: "debit",
    header: "Debit",
    cell: ({ row }) => {
      const debit = parseFloat(row.original.debit || "0");
      if (debit === 0) return "";
      return (
        <div className="text-sm text-red-600 font-semibold">
          {formatCurrency(debit.toString())}
        </div>
      );
    },
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => {
      const balance = parseFloat(row.original.balance || "0");
      const isBalanceRow = row.original.remark === "Opening Balance" || row.original.remark === "Closing Balance";
      const isNegative = balance < 0;
      
      return (
        <div
          className={cn(
            "text-sm font-semibold",
            isBalanceRow && "text-primary font-bold text-base",
            !isBalanceRow && isNegative && "text-destructive",
            !isBalanceRow && !isNegative && "text-green-600"
          )}
        >
          {formatCurrency(balance.toString())}
        </div>
      );
    },
  },
];

// Default column visibility for Invoices
export const defaultInvoicesColumnVisibility = {
  invoice_no: {
    name: "Invoice No.",
    visibility: true,
  },
  month_year: {
    name: "Month-Year",
    visibility: true,
  },
  invoice_date: {
    name: "Invoice Date Range",
    visibility: true,
  },
  invoice_type: {
    name: "Type",
    visibility: true,
  },
  category: {
    name: "Category",
    visibility: true,
  },
  total: {
    name: "Total Cost",
    visibility: true,
  },
  paid: {
    name: "Amount Paid",
    visibility: true,
  },
  pending: {
    name: "Pending Amount",
    visibility: true,
  },
};

// Default column visibility for Passbook
export const defaultPassbookColumnVisibility = {
  date: {
    name: "Date",
    visibility: true,
  },
  remark: {
    name: "Description",
    visibility: true,
  },
  credit: {
    name: "Credit",
    visibility: true,
  },
  debit: {
    name: "Debit",
    visibility: true,
  },
  balance: {
    name: "Balance",
    visibility: true,
  },
};

