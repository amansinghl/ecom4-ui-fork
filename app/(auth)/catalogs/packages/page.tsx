"use client";

import { useState } from "react";
import { usePackages } from "@/hooks/use-packages";
import { type PackageType } from "@/types/packages";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
import { columns } from "@/components/catalogs/packages/columns";
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

export default function Packages() {
  const params = useSearchParams();
  const pathname = usePathname();
  const { data, isLoading, error } = usePackages(
    Object.fromEntries(params.entries()),
  );

  const packages = data?.packages?.data ?? [];
  const [rowSelection, setRowSelection] = useState({});
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(
    null,
  );

  const handleEdit = (pkg: PackageType) => {
    setSelectedPackage(pkg);
    // TODO: Open edit dialog
    console.log("Edit package:", pkg);
  };

  // TODO
  const handleDelete = (pkg: PackageType) => {
    if (
      confirm(
        `Are you sure you want to delete "${pkg.package_identifier || pkg.id}"?`,
      )
    ) {
      console.log("Delete package:", pkg.id);
    }
  };

  const handleAdd = () => {
    setSelectedPackage(null);
    // TODO: Open add dialog
    console.log("Add package");
  };

  const table = useReactTable({
    data: packages,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
    meta: {
      onEdit: handleEdit,
      onDelete: handleDelete,
    },
    initialState: {
      columnPinning: {
        left: ["select", "package_identifier"],
      },
      pagination: {
        pageSize: 25,
      },
    },
  });

  if (isLoading || error) {
    return <h1>Loading...</h1>;
  }

  const rawPagination = data?.data?.packages ?? defaultPagination;
  const pagination = decoratePagination(
    rawPagination,
    pathname,
    params.toString(),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Packages</h1>
          <p className="text-muted-foreground text-sm">
            Manage your package configurations
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 size-4" />
          Add Package
        </Button>
      </div>

      <CustomPagination {...pagination} endpoint="/catalogs/packages" />
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
      <CustomPagination {...pagination} endpoint="/catalogs/packages" />
    </div>
  );
}
