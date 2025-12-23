"use client";

import { useState, useMemo, Suspense } from "react";
import { useCodTransactions } from "@/hooks/use-cod-transactions";
import { useCodTransactionsOverall } from "@/hooks/use-cod-transactions-overall";
import { usePartners } from "@/hooks/use-partners";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  usePathname,
  useSearchParams,
  useRouter,
} from "next/navigation";
import { createColumns } from "@/components/finance/cod-transactions-columns";
import { CodSnapshotCards } from "@/components/finance/cod-snapshot-cards";
import { CodFilters } from "@/components/finance/cod-filters";
import { CodRemittance } from "@/components/finance/cod-remittance";
import { Transactions } from "@/components/finance/transactions";
import { Invoices } from "@/components/finance/invoices";
import { defaultColumnVisibility, type ColumnVisibilityConfig } from "@/components/finance/column-config-dialog";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CustomPagination from "@/components/pagination";
import { decoratePagination } from "@/decorators/pagination";
import { PaginationType } from "@/types/shipments";
import { Wallet, Receipt, FileText, CreditCard } from "lucide-react";

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

function FinanceContent() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  
  const activeTab = params.get("tabLevel1") || "cod";
  
  const handleTabChange = (value: string) => {
    const newParams = new URLSearchParams(params.toString());
    if (value === "cod") {
      newParams.delete("tabLevel1");
    } else {
      newParams.set("tabLevel1", value);
    }
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const [filters, setFilters] = useState({
    trackingStatus: "all",
    codStatus: "all",
    shipmentNos: "",
    deliveredFromDate: "",
    deliveredToDate: "",
    paymentFromDate: "",
    paymentToDate: "",
    bookingFromDate: "",
    bookingToDate: "",
  });

  const queryParams = {
    sort: params.get("sort") || "shipment_no|desc",
    page: params.get("page") || "1",
    per_page: params.get("per_page") || "25",
    payment_from_date: filters.paymentFromDate || "",
    payment_to_date: filters.paymentToDate || "",
    delivered_from_date: filters.deliveredFromDate || "",
    delivered_to_date: filters.deliveredToDate || "",
    from_date: filters.bookingFromDate || "",
    to_date: filters.bookingToDate || "",
    shipment_nos: filters.shipmentNos || "",
    tracking_status: filters.trackingStatus !== "all" ? filters.trackingStatus : "",
    cod_status: filters.codStatus !== "all" ? filters.codStatus : "",
  };

  const { data, isLoading, error, refetch } = useCodTransactions(queryParams);
  
  const overallParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (filters.trackingStatus !== "all") {
      params.tracking_status = filters.trackingStatus;
    }
    if (filters.codStatus !== "all") {
      params.cod_status = filters.codStatus;
    }
    return Object.keys(params).length > 0 ? params : undefined;
  }, [filters.trackingStatus, filters.codStatus]);
  
  const { data: overallData, isLoading: overallLoading } = useCodTransactionsOverall(overallParams);
  const { data: partnersData } = usePartners();

  const transactions = data?.cod_transactions?.data ?? [];
  const partners = partnersData?.partners;
  const codAdjustable = data?.cod_adjustable === 1;
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityConfig>(defaultColumnVisibility);

  const allColumns = useMemo(
    () => createColumns(partners),
    [partners],
  );

  const columns = useMemo(() => {
    return allColumns.filter((column) => {
      const columnId = column.id || (column as { accessorKey?: string }).accessorKey;
      if (columnId === "select") return true;
      if (!columnId) return false;
      return columnVisibility[columnId]?.visibility !== false;
    });
  }, [allColumns, columnVisibility]);

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
    initialState: {
      columnPinning: {
        left: ["select", "shipment_no"],
      },
      pagination: {
        pageSize: 25,
      },
    },
  });

  if (isLoading || error) {
    return <h1>Loading...</h1>;
  }

  const rawPagination = data?.cod_transactions ?? defaultPagination;
  const pagination = decoratePagination(
    rawPagination,
    pathname,
    params.toString(),
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Finance</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage COD transactions and payments
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="inline-flex h-10 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground w-full">
          <TabsTrigger 
            value="cod"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
          >
            <Wallet className="mr-2 h-4 w-4" />
            COD
          </TabsTrigger>
          <TabsTrigger 
            value="cod_remittance"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
          >
            <Receipt className="mr-2 h-4 w-4" />
            COD Remittance
          </TabsTrigger>
          <TabsTrigger 
            value="transactions"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger 
            value="invoices"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
          >
            <FileText className="mr-2 h-4 w-4" />
            Invoices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cod" className="mt-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-primary">SNAPSHOT</h2>
              <CodSnapshotCards 
                data={overallData?.response} 
                isLoading={overallLoading}
              />
            </div>

            <CodFilters 
              onFiltersChange={setFilters} 
              currentSort={queryParams.sort}
              columnVisibility={columnVisibility}
              onColumnVisibilityChange={setColumnVisibility}
              codAdjustable={codAdjustable}
              partners={partners}
              onAdjustSuccess={() => {
                refetch();
              }}
            />
          </div>

          <CustomPagination {...pagination} endpoint="/finance" />
          <div className="overflow-hidden rounded-md border">
            {transactions?.length > 0 ? (
              <Table>
                <TableHeader className="bg-muted sticky top-0 z-10">
                  {table.getHeaderGroups().map((headerGroup) => (
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
                  {table?.getRowModel()?.rows?.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
          <CustomPagination {...pagination} endpoint="/finance" />
        </TabsContent>

        <TabsContent value="cod_remittance" className="mt-6">
          <CodRemittance />
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <Transactions />
        </TabsContent>

        <TabsContent value="invoices" className="mt-6">
          <Invoices />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function Finance() {
  return (
    <Suspense fallback={<h1>Loading...</h1>}>
      <FinanceContent />
    </Suspense>
  );
}
