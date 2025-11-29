"use client";

import { useShipments } from "@/hooks/use-shipments";
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
import { columns } from "@/components/shipments/columns";
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

export default function Shipments() {
  const params = useSearchParams();
  const pathname = usePathname();
  const { data, isLoading, error } = useShipments(
    Object.fromEntries(params.entries()),
  );

  const shipments = data?.data?.shipments?.data ?? [];

  const table = useReactTable({
    data: shipments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    initialState: {
      columnPinning: {
        left: ["shipment_no"],
      },
      pagination: {
        pageSize: 25,
      },
    },
  });

  if (isLoading || error) {
    return <h1>Loading...</h1>;
  }

  const rawPagination = data?.data?.shipments ?? defaultPagination;
  const pagination = decoratePagination(
    rawPagination,
    pathname,
    params.toString(),
  );

  const changePageSize = (pageSize = 25) => {
    if (pageSize !== pagination.per_page) {
      let currentParams = window.location.search;
      if (currentParams.includes("per_page=")) {
        currentParams = currentParams.replace(
          "per_page=" + pagination.per_page,
          "per_page=" + pageSize,
        );
      } else {
        const queryAppend = currentParams.includes("?") ? "&" : "?";
        currentParams += queryAppend + "per_page=" + pageSize;
      }
      redirect("/shipments" + currentParams, RedirectType.push);
    }
  };

  return (
    <div>
      <CustomPagination {...pagination} changePageSize={changePageSize} />
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
              <TableRow key={row.id}>
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
      <CustomPagination {...pagination} changePageSize={changePageSize} />
    </div>
  );
}
