"use client";

import { useState, useMemo, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useInvoices } from "@/hooks/use-invoices";
import { useAccountSummary } from "@/hooks/use-account-summary";
import { downloadInvoice } from "@/api/invoices";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ColumnConfigDialog, type ColumnVisibilityConfig } from "@/components/finance/column-config-dialog";
import {
  invoicesColumns,
  passbookColumns,
  defaultInvoicesColumnVisibility,
  defaultPassbookColumnVisibility,
} from "@/components/finance/invoices-columns";
import CustomPagination from "@/components/pagination";
import { decoratePagination } from "@/decorators/pagination";
import { PaginationType } from "@/types/shipments";
import { PassbookTransactionType } from "@/types/invoices";
import {
  FileText,
  Settings,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

const defaultPagination: PaginationType = {
  first_page_url: null,
  prev_page_url: null,
  next_page_url: "",
  last_page_url: "",
  current_page: 1,
  from: 1,
  to: 1,
  last_page: 1,
  per_page: 25,
  total: 1,
};

export function Invoices() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get active sub-tab - default to "invoices" if not set
  const activeSubTab = searchParams.get("tabLevel2") || "invoices";
  
  // Invoices Tab State
  const [invoicesColumnVisibility, setInvoicesColumnVisibility] = useState<ColumnVisibilityConfig>(() => {
    const initial: ColumnVisibilityConfig = {};
    Object.entries(defaultInvoicesColumnVisibility).forEach(([key, config]) => {
      initial[key] = { ...config };
    });
    return initial;
  });
  const [isInvoicesColumnConfigOpen, setIsInvoicesColumnConfigOpen] = useState(false);

  // Passbook Tab State
  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    const now = new Date();
    return now.getMonth() + 1; // 1-based month
  });
  const [passbookColumnVisibility, setPassbookColumnVisibility] = useState<ColumnVisibilityConfig>(() => {
    const initial: ColumnVisibilityConfig = {};
    Object.entries(defaultPassbookColumnVisibility).forEach(([key, config]) => {
      initial[key] = { ...config };
    });
    return initial;
  });
  const [isPassbookColumnConfigOpen, setIsPassbookColumnConfigOpen] = useState(false);

  // Ensure tabLevel2 is set in URL on mount if not present
  useEffect(() => {
    if (!searchParams.get("tabLevel2")) {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("tabLevel1", "invoices");
      newParams.set("tabLevel2", "invoices");
      router.replace(`${pathname}?${newParams.toString()}`);
    }
  }, [searchParams, pathname, router]);

  const handleSubTabChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("tabLevel1", "invoices");
    newParams.set("tabLevel2", value);
    router.push(`${pathname}?${newParams.toString()}`);
  };

  // Generate last 3 months for dropdown (as per API documentation)
  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Generate last 3 months
    for (let i = 0; i < 3; i++) {
      const monthIndex = now.getMonth() - i;
      const year = now.getFullYear();
      const adjustedDate = new Date(year, monthIndex);
      
      const monthNum = adjustedDate.getMonth() + 1; // 1-based month (1-12)
      const monthLabel = `${months[adjustedDate.getMonth()]} ${adjustedDate.getFullYear()}`;
      
      options.unshift({ value: monthNum, label: monthLabel });
    }
    
    return options;
  }, []);

  // Set default month to current month on mount
  useEffect(() => {
    if (activeSubTab === "passbook" && !selectedMonth) {
      const now = new Date();
      setSelectedMonth(now.getMonth() + 1); // 1-based month
    }
  }, [activeSubTab, selectedMonth]);

  // Invoices Tab Data
  const invoicesQueryParams = useMemo(() => {
    const params: Record<string, string> = {
      sind: "invoice_no",
      sord: searchParams.get("sord") || "desc",
      page: searchParams.get("page") || "1",
      per_page: searchParams.get("per_page") || "25",
    };
    return params;
  }, [searchParams]);

  const { data: invoicesData } = useInvoices(invoicesQueryParams);
  const invoices = invoicesData?.invoices?.data ?? [];
  const rawInvoicesPagination: PaginationType = invoicesData?.invoices 
    ? {
        ...defaultPagination,
        current_page: invoicesData.invoices.current_page,
        from: invoicesData.invoices.from ?? defaultPagination.from,
        to: invoicesData.invoices.to ?? defaultPagination.to,
        last_page: invoicesData.invoices.last_page,
        per_page: invoicesData.invoices.per_page,
        total: invoicesData.invoices.total,
      }
    : defaultPagination;
  const invoicesPagination = decoratePagination(
    rawInvoicesPagination,
    pathname,
    searchParams.toString()
  );

  // Passbook Tab Data
  const passbookQueryParams = useMemo(() => {
    if (activeSubTab !== "passbook") return undefined; // Only fetch when passbook tab is active
    return {
      month: selectedMonth.toString(),
    };
  }, [selectedMonth, activeSubTab]);

  const { data: passbookData } = useAccountSummary(passbookQueryParams);
  
  const passbookTransactions = useMemo(() => {
    if (!passbookData) return [];
    
    const transactions: PassbookTransactionType[] = [];
    
    // Add closing balance at top (as per API documentation)
    transactions.push({
      date: null,
      remark: "Closing Balance",
      credit: "0",
      debit: "0",
      balance: passbookData.closing_balance || "0",
    });
    
    // Add actual transactions (in chronological order from API)
    if (passbookData.transactions && Array.isArray(passbookData.transactions)) {
      transactions.push(...passbookData.transactions);
    }
    
    // Add opening balance at bottom (as per API documentation)
    transactions.push({
      date: null,
      remark: "Opening Balance",
      credit: "0",
      debit: "0",
      balance: passbookData.opening_balance || "0",
    });
    
    return transactions;
  }, [passbookData]);

  // Convert column visibility to VisibilityState for react-table
  const invoicesVisibilityState = useMemo(() => {
    const state: VisibilityState = {};
    Object.entries(invoicesColumnVisibility).forEach(([key, config]) => {
      state[key] = config.visibility;
    });
    return state;
  }, [invoicesColumnVisibility]);

  const passbookVisibilityState = useMemo(() => {
    const state: VisibilityState = {};
    Object.entries(passbookColumnVisibility).forEach(([key, config]) => {
      state[key] = config.visibility;
    });
    return state;
  }, [passbookColumnVisibility]);

  // Invoices table
  const invoicesTable = useReactTable({
    data: invoices,
    columns: invoicesColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    state: {
      columnVisibility: invoicesVisibilityState,
    },
    onColumnVisibilityChange: (updater) => {
      const newState =
        typeof updater === "function"
          ? updater(invoicesVisibilityState)
          : updater;
      const updated: ColumnVisibilityConfig = { ...invoicesColumnVisibility };
      Object.entries(newState).forEach(([key, visible]) => {
        if (updated[key]) {
          updated[key] = { ...updated[key], visibility: visible };
        }
      });
      setInvoicesColumnVisibility(updated);
    },
    enableHiding: true,
  });

  // Passbook table
  const passbookTable = useReactTable({
    data: passbookTransactions,
    columns: passbookColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    state: {
      columnVisibility: passbookVisibilityState,
    },
    onColumnVisibilityChange: (updater) => {
      const newState =
        typeof updater === "function"
          ? updater(passbookVisibilityState)
          : updater;
      const updated: ColumnVisibilityConfig = { ...passbookColumnVisibility };
      Object.entries(newState).forEach(([key, visible]) => {
        if (updated[key]) {
          updated[key] = { ...updated[key], visibility: visible };
        }
      });
      setPassbookColumnVisibility(updated);
    },
    enableHiding: true,
  });

  // Handle invoice download
  const handleDownloadInvoice = async (invoiceNumber: string) => {
    try {
      toast.loading("Downloading invoice...", { id: `invoice-${invoiceNumber}` });
      const response = await downloadInvoice(invoiceNumber);
      toast.success(response.message || "Invoice download initiated successfully!", {
        id: `invoice-${invoiceNumber}`,
      });
    } catch (error) {
      console.error("Download invoice failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to download invoice.",
        { id: `invoice-${invoiceNumber}` }
      );
    }
  };

  // Handle voucher download events
  useEffect(() => {
    const handleDownloadInvoiceEvent = (e: CustomEvent) => {
      handleDownloadInvoice(e.detail.invoiceNumber);
    };

    window.addEventListener(
      "download-invoice",
      handleDownloadInvoiceEvent as EventListener,
    );

    return () => {
      window.removeEventListener(
        "download-invoice",
        handleDownloadInvoiceEvent as EventListener,
      );
    };
  }, []);

  return (
    <div>
      <Tabs value={activeSubTab} onValueChange={handleSubTabChange} className="w-full">
        <TabsList className="inline-flex h-10 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground w-full">
          <TabsTrigger
            value="invoices"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
          >
            <FileText className="mr-2 h-4 w-4" />
            Invoices
          </TabsTrigger>
          <TabsTrigger
            value="passbook"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Passbook
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Manage Invoices</h2>
            <Button
              onClick={() => setIsInvoicesColumnConfigOpen(true)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Settings className="h-3.5 w-3.5" />
              Column Config
            </Button>
          </div>

          <CustomPagination {...invoicesPagination} endpoint="/finance?tabLevel1=invoices&tabLevel2=invoices" />
          <div className="overflow-hidden rounded-md border">
            {invoices.length > 0 ? (
              <Table>
                <TableHeader className="bg-muted sticky top-0 z-10">
                  {invoicesTable.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {invoicesTable.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-3 text-center">
                <div>No data available.</div>
                <div className="text-sm text-secondary-foreground font-semibold">
                  Hint: You might wanna check the filters or the other search
                  criteria.
                </div>
              </div>
            )}
          </div>
          <CustomPagination {...invoicesPagination} endpoint="/finance?tabLevel1=invoices&tabLevel2=invoices" />

          <ColumnConfigDialog
            open={isInvoicesColumnConfigOpen}
            onOpenChange={setIsInvoicesColumnConfigOpen}
            columnVisibility={invoicesColumnVisibility}
            onColumnVisibilityChange={setInvoicesColumnVisibility}
          />
        </TabsContent>

        <TabsContent value="passbook" className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Transaction Passbook</h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="month-select" className="text-sm font-semibold">
                  Select Month:
                </Label>
                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(value) => setSelectedMonth(Number(value))}
                >
                  <SelectTrigger id="month-select" className="w-[150px] h-9">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => setIsPassbookColumnConfigOpen(true)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Settings className="h-3.5 w-3.5" />
                Column Config
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-md border">
            {passbookTransactions.length > 0 ? (
              <Table>
                <TableHeader className="bg-muted sticky top-0 z-10">
                  {passbookTable.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {passbookTable.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-3 text-center">
                <div>No data available.</div>
                <div className="text-sm text-secondary-foreground font-semibold">
                  Hint: You might wanna check the filters or the other search
                  criteria.
                </div>
              </div>
            )}
          </div>

          <ColumnConfigDialog
            open={isPassbookColumnConfigOpen}
            onOpenChange={setIsPassbookColumnConfigOpen}
            columnVisibility={passbookColumnVisibility}
            onColumnVisibilityChange={setPassbookColumnVisibility}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

