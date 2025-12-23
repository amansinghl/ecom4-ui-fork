"use client";

import { useState, useMemo, useEffect } from "react";
import { useCredit } from "@/hooks/use-credit";
import { usePayments } from "@/hooks/use-payments";
import { useLedger } from "@/hooks/use-ledger";
import { useUser } from "@/hooks/use-user";
import { useQueryClient } from "@tanstack/react-query";
import {
  addMoneyToWallet,
  downloadTransactions,
  downloadLedger,
  downloadVoucherPdf,
  downloadLedgerVoucherPdf,
} from "@/api/transactions";
import { refreshWallet } from "@/api/transactions";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DateRangePicker } from "@/components/finance/date-range-picker";
import { ColumnConfigDialog, type ColumnVisibilityConfig } from "@/components/finance/column-config-dialog";
import {
  paymentsColumns,
  ledgerColumns,
  defaultPaymentsColumnVisibility,
  defaultLedgerColumnVisibility,
} from "@/components/finance/transactions-columns";
import CustomPagination from "@/components/pagination";
import { decoratePagination } from "@/decorators/pagination";
import { PaginationType } from "@/types/shipments";
import {
  RefreshCw,
  Download,
  Calendar,
  Search,
  Loader2,
  Plus,
  Settings,
  CreditCard,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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

export function Transactions() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Get active sub-tab - default to "transactions" if not set
  const activeSubTab = params.get("tabLevel2") || "transactions";

  // Ensure tabLevel2 is set in URL on mount if not present
  useEffect(() => {
    if (!params.get("tabLevel2")) {
      const newParams = new URLSearchParams(params.toString());
      newParams.set("tabLevel2", "transactions");
      router.replace(`${pathname}?${newParams.toString()}`);
    }
  }, [params, pathname, router]);

  const handleSubTabChange = (value: string) => {
    const newParams = new URLSearchParams(params.toString());
    newParams.set("tabLevel2", value);
    router.push(`${pathname}?${newParams.toString()}`);
  };

  // Credit/Wallet state
  const { data: creditData, isLoading: isLoadingCredit } = useCredit();
  const { user } = useUser();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [walletAmount, setWalletAmount] = useState("");
  const [isAddingMoney, setIsAddingMoney] = useState(false);

  // Payments tab state
  const [paymentsFromDate, setPaymentsFromDate] = useState("");
  const [paymentsToDate, setPaymentsToDate] = useState("");
  const [paymentsColumnVisibility, setPaymentsColumnVisibility] = useState<ColumnVisibilityConfig>(() => {
    const initial: ColumnVisibilityConfig = {};
    Object.entries(defaultPaymentsColumnVisibility).forEach(([key, config]) => {
      initial[key] = { ...config };
    });
    return initial;
  });
  const [isPaymentsColumnConfigOpen, setIsPaymentsColumnConfigOpen] = useState(false);

  // Ledger tab state
  const [ledgerFromDate, setLedgerFromDate] = useState("");
  const [ledgerToDate, setLedgerToDate] = useState("");
  const [ledgerSearch, setLedgerSearch] = useState("");
  const [ledgerColumnVisibility, setLedgerColumnVisibility] = useState<ColumnVisibilityConfig>(() => {
    const initial: ColumnVisibilityConfig = {};
    Object.entries(defaultLedgerColumnVisibility).forEach(([key, config]) => {
      initial[key] = { ...config };
    });
    return initial;
  });
  const [isLedgerColumnConfigOpen, setIsLedgerColumnConfigOpen] = useState(false);

  // Build query params
  const paymentsParams = useMemo(() => {
    const p: Record<string, string> = {
      sort: params.get("sort") || "transaction_date|desc",
      page: params.get("page") || "1",
      per_page: params.get("per_page") || "25",
    };
    if (paymentsFromDate) p.from_date = paymentsFromDate;
    if (paymentsToDate) p.to_date = paymentsToDate;
    return p;
  }, [params, paymentsFromDate, paymentsToDate]);

  const ledgerParams = useMemo(() => {
    const p: Record<string, string> = {
      sort: params.get("sort") || "transaction_date|desc",
      page: params.get("page") || "1",
      per_page: params.get("per_page") || "25",
    };
    if (ledgerFromDate) p.from_date = ledgerFromDate;
    if (ledgerToDate) p.to_date = ledgerToDate;
    if (ledgerSearch) p.q = ledgerSearch;
    return p;
  }, [params, ledgerFromDate, ledgerToDate, ledgerSearch]);

  const { data: paymentsData } =
    usePayments(activeSubTab === "transactions" ? paymentsParams : undefined);
  const { data: ledgerData } = useLedger(
    activeSubTab === "ledger-balance" ? ledgerParams : undefined,
  );

  const creditBalance = creditData?.creditDetails?.credit_balance || "0.00";
  const creditLimit = creditData?.creditDetails?.credit_limit || "0.00";

  const handleRefreshWallet = async () => {
    try {
      setIsRefreshing(true);
      await refreshWallet();
      await queryClient.invalidateQueries({ queryKey: ["credit"] });
      toast.success("Wallet balance refreshed");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to refresh wallet",
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddMoney = async () => {
    if (!walletAmount || parseFloat(walletAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const amount = parseFloat(walletAmount);
    if (amount < 1 || amount > 300000) {
      toast.error("Amount must be between ₹1 and ₹300,000");
      return;
    }

    if (!user) {
      toast.error("User information not available");
      return;
    }

    try {
      setIsAddingMoney(true);
      const userName = `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.name || "User";
      const result = await addMoneyToWallet({
        name: userName,
        email: user.email || "",
        mobile: user.mobile_no || "",
        amount: walletAmount,
        remark: "This request from ecom 3",
        product: "Adding money to Wallet from Ecom3",
        booking_reference_number: null,
        gateway_name: "PayU Money",
      });

      // Redirect to payment gateway
      window.location.href = result.url;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add money",
      );
      setIsAddingMoney(false);
    }
  };

  const handleDownloadPayments = async () => {
    try {
      const blob = await downloadTransactions(paymentsParams);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `transactions_${format(new Date(), "yyyy-MM-dd")}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Transactions downloaded successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to download CSV",
      );
    }
  };

  const handleDownloadLedger = async () => {
    try {
      const csvContent = await downloadLedger(ledgerParams);
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "ledger.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Ledger downloaded successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to download CSV",
      );
    }
  };

  const handleDownloadVoucher = async (
    voucherNo: string,
    isLedger = false,
  ) => {
    try {
      const base64Data = isLedger
        ? await downloadLedgerVoucherPdf(voucherNo)
        : await downloadVoucherPdf(voucherNo);

      // Create blob from base64
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${voucherNo}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Voucher downloaded successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to download voucher",
      );
    }
  };

  const payments = paymentsData?.transactions?.data ?? [];
  const paymentsPagination = paymentsData?.transactions ?? defaultPagination;
  const paymentsPaginationDecorated = decoratePagination(
    paymentsPagination,
    pathname,
    params.toString(),
  );

  const ledgerTransactions = ledgerData?.ledgerTransactions?.data ?? [];
  const ledgerPagination =
    ledgerData?.ledgerTransactions ?? defaultPagination;
  const ledgerPaginationDecorated = decoratePagination(
    ledgerPagination,
    pathname,
    params.toString(),
  );


  // Convert column visibility to VisibilityState for react-table
  const paymentsVisibilityState = useMemo(() => {
    const state: VisibilityState = {};
    Object.entries(paymentsColumnVisibility).forEach(([key, config]) => {
      state[key] = config.visibility;
    });
    return state;
  }, [paymentsColumnVisibility]);

  const ledgerVisibilityState = useMemo(() => {
    const state: VisibilityState = {};
    Object.entries(ledgerColumnVisibility).forEach(([key, config]) => {
      state[key] = config.visibility;
    });
    return state;
  }, [ledgerColumnVisibility]);

  // Payments table
  const paymentsTable = useReactTable({
    data: payments,
    columns: paymentsColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    state: {
      columnVisibility: paymentsVisibilityState,
    },
    onColumnVisibilityChange: (updater) => {
      const newState =
        typeof updater === "function"
          ? updater(paymentsVisibilityState)
          : updater;
      const updated: ColumnVisibilityConfig = { ...paymentsColumnVisibility };
      Object.entries(newState).forEach(([key, visible]) => {
        if (updated[key]) {
          updated[key] = { ...updated[key], visibility: visible };
        }
      });
      setPaymentsColumnVisibility(updated);
    },
    enableHiding: true,
  });

  // Ledger table
  const ledgerTable = useReactTable({
    data: ledgerTransactions,
    columns: ledgerColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    state: {
      columnVisibility: ledgerVisibilityState,
    },
    onColumnVisibilityChange: (updater) => {
      const newState =
        typeof updater === "function"
          ? updater(ledgerVisibilityState)
          : updater;
      const updated: ColumnVisibilityConfig = { ...ledgerColumnVisibility };
      Object.entries(newState).forEach(([key, visible]) => {
        if (updated[key]) {
          updated[key] = { ...updated[key], visibility: visible };
        }
      });
      setLedgerColumnVisibility(updated);
    },
    enableHiding: true,
  });

  // Handle voucher download events
  useEffect(() => {
    const handleDownloadVoucherEvent = (e: CustomEvent) => {
      handleDownloadVoucher(e.detail.voucherNo, false);
    };

    const handleDownloadLedgerVoucherEvent = (e: CustomEvent) => {
      handleDownloadVoucher(e.detail.voucherNo, true);
    };

    window.addEventListener(
      "download-voucher",
      handleDownloadVoucherEvent as EventListener,
    );
    window.addEventListener(
      "download-ledger-voucher",
      handleDownloadLedgerVoucherEvent as EventListener,
    );

    return () => {
      window.removeEventListener(
        "download-voucher",
        handleDownloadVoucherEvent as EventListener,
      );
      window.removeEventListener(
        "download-ledger-voucher",
        handleDownloadLedgerVoucherEvent as EventListener,
      );
    };
  }, []);

  return (
    <div>
      {/* Balance Card */}
      <Card className="border-border shadow-sm mb-6">
        <CardContent className="pt-5 pb-5">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-semibold text-foreground">
                  Current Balance
                </Label>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleRefreshWallet}
                  disabled={isRefreshing}
                >
                  <RefreshCw
                    className={cn(
                      "h-4 w-4",
                      isRefreshing && "animate-spin",
                    )}
                  />
                </Button>
              </div>
              <div className="text-2xl font-bold">
                {isLoadingCredit ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  formatCurrency(creditBalance)
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">
                Amount to add
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={walletAmount}
                  onChange={(e) => setWalletAmount(e.target.value)}
                  className="flex-1"
                  min="1"
                  max="300000"
                />
                <Button
                  onClick={handleAddMoney}
                  disabled={isAddingMoney || !walletAmount}
                  className="gap-2"
                >
                  {isAddingMoney ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Add Money
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">
                Credit Limit
              </Label>
              <div className="text-lg font-semibold">
                {isLoadingCredit ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  formatCurrency(creditLimit)
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sub Tabs */}
      <Tabs value={activeSubTab} onValueChange={handleSubTabChange}>
        <TabsList className="inline-flex h-10 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground w-full">
          <TabsTrigger
            value="transactions"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger
            value="ledger-balance"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
          >
            <FileText className="mr-2 h-4 w-4" />
            Ledger Balance
          </TabsTrigger>
        </TabsList>

        {/* Payments Tab */}
        <TabsContent value="transactions" className="mt-6">
          {/* Filters */}
          <Card className="border-border shadow-sm mb-6">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-end gap-3 flex-wrap">
                <div className="w-[280px]">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Date Range
                    </Label>
                    <DateRangePicker
                      fromDate={paymentsFromDate}
                      toDate={paymentsToDate}
                      onFromDateChange={setPaymentsFromDate}
                      onToDateChange={setPaymentsToDate}
                      startPlaceholder="Start date"
                      endPlaceholder="End date"
                      id="payments-date-range"
                    />
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    onClick={handleDownloadPayments}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </Button>
                  <Button
                    onClick={() => setIsPaymentsColumnConfigOpen(true)}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Column Config
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <CustomPagination
            {...paymentsPaginationDecorated}
            endpoint="/finance?tabLevel1=transactions&tabLevel2=transactions"
          />
          {/* Table */}
          <div className="overflow-hidden rounded-md border">
            {payments.length > 0 ? (
              <Table>
                <TableHeader className="bg-muted sticky top-0 z-10">
                  {paymentsTable.getHeaderGroups().map((headerGroup) => (
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
                  {paymentsTable.getRowModel().rows.map((row) => (
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
          <CustomPagination
            {...paymentsPaginationDecorated}
            endpoint="/finance?tabLevel1=transactions&tabLevel2=transactions"
          />

          {/* Column Config Dialog for Payments */}
          <ColumnConfigDialog
            open={isPaymentsColumnConfigOpen}
            onOpenChange={setIsPaymentsColumnConfigOpen}
            columnVisibility={paymentsColumnVisibility}
            onColumnVisibilityChange={setPaymentsColumnVisibility}
          />
        </TabsContent>

        {/* Ledger Balance Tab */}
        <TabsContent value="ledger-balance" className="mt-6">
          {/* Filters */}
          <Card className="border-border shadow-sm mb-6">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-end gap-3 flex-wrap">
                <div className="w-[200px]">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Search className="h-3.5 w-3.5" />
                      Search By Shipment No.
                    </Label>
                    <Input
                      placeholder="Enter shipment number"
                      value={ledgerSearch}
                      onChange={(e) => setLedgerSearch(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>
                <div className="w-[280px]">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Date Range
                    </Label>
                    <DateRangePicker
                      fromDate={ledgerFromDate}
                      toDate={ledgerToDate}
                      onFromDateChange={setLedgerFromDate}
                      onToDateChange={setLedgerToDate}
                      startPlaceholder="Start date"
                      endPlaceholder="End date"
                      id="ledger-date-range"
                    />
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    onClick={handleDownloadLedger}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => setIsLedgerColumnConfigOpen(true)}
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Column Config
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <CustomPagination
            {...ledgerPaginationDecorated}
            endpoint="/finance?tabLevel1=transactions&tabLevel2=ledger-balance"
          />
          {/* Table */}
          <div className="overflow-hidden rounded-md border">
            {ledgerTransactions.length > 0 ? (
              <Table>
                <TableHeader className="bg-muted sticky top-0 z-10">
                  {ledgerTable.getHeaderGroups().map((headerGroup) => (
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
                  {ledgerTable.getRowModel().rows.map((row) => (
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
          <CustomPagination
            {...ledgerPaginationDecorated}
            endpoint="/finance?tabLevel1=transactions&tabLevel2=ledger-balance"
          />

          {/* Column Config Dialog for Ledger */}
          <ColumnConfigDialog
            open={isLedgerColumnConfigOpen}
            onOpenChange={setIsLedgerColumnConfigOpen}
            columnVisibility={ledgerColumnVisibility}
            onColumnVisibilityChange={setLedgerColumnVisibility}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

