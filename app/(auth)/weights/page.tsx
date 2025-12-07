"use client";

import { useState } from "react";
import { useWeights } from "@/hooks/use-weights";
import { type WeightDisputeType } from "@/types/weights";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  usePathname,
  useSearchParams,
  redirect,
  RedirectType,
} from "next/navigation";
import { columns } from "@/components/weights/columns";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import CustomPagination from "@/components/pagination";
import { decoratePagination } from "@/decorators/pagination";
import { PaginationType } from "@/types/shipments";

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

export default function Weights() {
  const params = useSearchParams();
  const pathname = usePathname();

  // Build queryParams with defaults
  const queryParams = {
    sort: "shipment_no|desc",
    page: "1",
    per_page: "25",
    ...Object.fromEntries(params.entries()),
  };

  const { data, isLoading, error } = useWeights(queryParams);

  const disputes = data?.data?.disputable?.data ?? [];
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data: disputes,
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

  const rawPagination = data?.data?.disputable ?? defaultPagination;
  const pagination = decoratePagination(
    rawPagination,
    pathname,
    params.toString(),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Weight Disputes</h1>
          <p className="text-muted-foreground text-sm">
            Manage weight disputes and discrepancies
          </p>
        </div>
      </div>

      <CustomPagination {...pagination} endpoint="/weights" />
      <div className="overflow-hidden rounded-md border">
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
      </div>
      <CustomPagination {...pagination} endpoint="/weights" />
    </div>
  );
}
