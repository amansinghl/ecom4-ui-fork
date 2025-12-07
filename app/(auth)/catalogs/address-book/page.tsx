"use client";

import { useState } from "react";
import { useLocations } from "@/hooks/use-locations";
import { type LocationType } from "@/types/locations";
import { LocationDialog } from "@/components/catalogs/address-book/location-dialog";
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
import { columns } from "@/components/catalogs/address-book/columns";
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

export default function AddressBook() {
  const params = useSearchParams();
  const pathname = usePathname();
  const { data, isLoading, error } = useLocations(
    Object.fromEntries(params.entries()),
  );

  const locations = data?.data?.locations?.data ?? [];
  const [rowSelection, setRowSelection] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationType | null>(
    null,
  );

  const handleEdit = (location: LocationType) => {
    setSelectedLocation(location);
    setDialogOpen(true);
  };

  // TODO
  const handleDelete = (location: LocationType) => {
    if (
      confirm(`Are you sure you want to delete "${location.location_name}"?`)
    ) {
      console.log("Delete location:", location.id);
    }
  };

  const handleAdd = () => {
    setSelectedLocation(null);
    setDialogOpen(true);
  };

  // TODO
  const handleSave = (locationData: Partial<LocationType>) => {
    console.log("Save location:", locationData);
    // After save, we should refetch the data
    // queryClient.invalidateQueries({ queryKey: ["locations"] });
  };

  const table = useReactTable({
    data: locations,
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
        left: ["select", "location_name"],
      },
      pagination: {
        pageSize: 25,
      },
    },
  });

  if (isLoading || error) {
    return <h1>Loading...</h1>;
  }

  const rawPagination = data?.data?.locations ?? defaultPagination;
  const pagination = decoratePagination(
    rawPagination,
    pathname,
    params.toString(),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Address Book</h1>
          <p className="text-muted-foreground text-sm">
            Manage your address book entries
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 size-4" />
          Add Address
        </Button>
      </div>

      <LocationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        location={selectedLocation}
        onSave={handleSave}
      />

      <CustomPagination {...pagination} endpoint="/catalogs/address-book" />
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
      <CustomPagination {...pagination} endpoint="/catalogs/address-book" />
    </div>
  );
}
