"use client";

import { useState, Suspense } from "react";
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
import { ProductDialog } from "@/components/catalogs/products/product-dialog";
import { deleteProduct } from "@/api/products";
import { useQueryClient } from "@tanstack/react-query";
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

function ProductsContent() {
  const params = useSearchParams();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useProducts(
    Object.fromEntries(params.entries()),
  );

  const products = data?.products?.data ?? [];
  const [rowSelection, setRowSelection] = useState({});
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleEdit = (product: ProductType) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleDelete = async (product: ProductType) => {
    if (
      !confirm(
        `Are you sure you want to delete "${product.product_name}"?`,
      )
    ) {
      return;
    }

    if (!product.id) {
      toast.error("Product ID is required");
      return;
    }

    try {
      await deleteProduct(product.id);
      toast.success("Product deleted successfully");
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (error) {
      toast.error("Failed to delete product");
      console.error("Error deleting product:", error);
    }
  };

  const handleAdd = () => {
    setSelectedProduct(null);
    setDialogOpen(true);
  };

  const handleSave = (productData: Partial<ProductType>) => {
    console.log("Save product:", productData);
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

  const rawPagination = data?.products ?? defaultPagination;
  const pagination = decoratePagination(
    rawPagination,
    pathname,
    params.toString(),
  );

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

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={selectedProduct}
        onSave={handleSave}
      />

      <CustomPagination {...pagination} endpoint="/catalogs/products" />
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
      <CustomPagination {...pagination} endpoint="/catalogs/products" />
    </div>
  );
}

export default function Products() {
  return (
    <Suspense fallback={<h1>Loading...</h1>}>
      <ProductsContent />
    </Suspense>
  );
}
