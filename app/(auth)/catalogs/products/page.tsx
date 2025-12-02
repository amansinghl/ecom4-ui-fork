"use client";

import { useState } from "react";
import { useProducts } from "@/hooks/use-products";
import { type ProductType } from "@/types/products";
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
import { columns } from "@/components/catalogs/products/columns";
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

export default function Products() {
  const params = useSearchParams();
  const pathname = usePathname();
  const { data, isLoading, error } = useProducts(
    Object.fromEntries(params.entries()),
  );

  const products = data?.data?.products?.data ?? [];
  const [rowSelection, setRowSelection] = useState({});
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);

  const handleEdit = (product: ProductType) => {
    setSelectedProduct(product);
    // TODO: Open edit dialog
    console.log("Edit product:", product);
  };

  // TODO
  const handleDelete = (product: ProductType) => {
    if (confirm(`Are you sure you want to delete "${product.product_name}"?`)) {
      console.log("Delete product:", product.id);
    }
  };

  const handleAdd = () => {
    setSelectedProduct(null);
    // TODO: Open add dialog
    console.log("Add product");
  };

  const table = useReactTable({
    data: products,
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
        left: ["select", "product_name"],
      },
      pagination: {
        pageSize: 25,
      },
    },
  });

  if (isLoading || error) {
    return <h1>Loading...</h1>;
  }

  const rawPagination = data?.data?.products ?? defaultPagination;
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
      redirect("/catalogs/products" + currentParams, RedirectType.push);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-muted-foreground text-sm">
            Manage your product catalog
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 size-4" />
          Add Product
        </Button>
      </div>

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
      <CustomPagination {...pagination} changePageSize={changePageSize} />
    </div>
  );
}
