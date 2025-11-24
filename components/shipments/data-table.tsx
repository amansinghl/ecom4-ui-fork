"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import CustomPagination from "@/components/pagination";

import { PaginationType } from "@/types/shipments";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import ShipmentsRow from "@/components/shipments/shipments-row";

interface DataTableProps<TData, TValue> {
  changePageSize: (pageSize: number) => void;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pagination: PaginationType;
}

export function DataTable<TData, TValue>({
  changePageSize,
  columns,
  data,
  pagination,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
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

  return (
    <>
      <CustomPagination {...pagination} changePageSize={changePageSize} />
      <div className="overflow-scroll rounded-md border">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10 text-center">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead className="pl-5" key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table
                .getRowModel()
                .rows.map((row) => (
                  <ShipmentsRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    data={row}
                  />
                ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <CustomPagination {...pagination} changePageSize={changePageSize} />
    </>
  );
}
