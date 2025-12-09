"use client";

import { useState } from "react";
import { useLocations } from "@/hooks/use-locations";
import { type LocationType } from "@/types/locations";
import { LocationDialog } from "@/components/catalogs/address-book/location-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { deleteLocation } from "@/api/locations";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useLocations(
    Object.fromEntries(params.entries()),
  );

  const locations = data?.locations?.data ?? [];
  const [rowSelection, setRowSelection] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationType | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Filter locations based on search query
  const filteredLocations = locations.filter((location) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    
    // Search across all relevant fields - ensure all are strings
    const searchableFields = [
      String(location.location_name || ""),
      String(location.id || ""),
      String(location.location_type || ""),
      String(location.full_name || ""),
      String(location.email || ""),
      String(location.contact || ""),
      String(location.calling_code || ""),
      String(location.address_line_1 || ""),
      String(location.address_line_2 || ""),
      String(location.landmark || ""),
      String(location.pincode || ""),
      String(location.city || ""),
      String(location.state || ""),
      String(location.country || ""),
      String(location.channel_name || ""),
    ];

    // Combine address parts for searching
    const addressParts = [
      location.address_line_1,
      location.address_line_2,
      location.landmark,
    ]
      .filter(Boolean)
      .map(String)
      .join(" ");

    const fullAddress = `${addressParts} ${location.city || ""} ${location.state || ""} ${location.pincode || ""} ${location.country || ""}`.toLowerCase();

    // Check if query matches any field
    return (
      searchableFields.some((field) => field.toLowerCase().includes(query)) ||
      fullAddress.includes(query) ||
      // Also search formatted phone/email
      (location.contact && `${location.calling_code || ""} ${location.contact}`.toLowerCase().includes(query))
    );
  });

  const handleEdit = (location: LocationType) => {
    setSelectedLocation(location);
    setDialogOpen(true);
  };

  const handleDelete = async (location: LocationType) => {
    if (
      !confirm(`Are you sure you want to delete "${location.location_name}"?`)
    ) {
      return;
    }

    try {
      await deleteLocation(location as Record<string, any>);
      toast.success("Location deleted successfully");
      // Invalidate queries to refetch data
      await queryClient.invalidateQueries({ queryKey: ["locations"] });
    } catch (error) {
      toast.error("Failed to delete location");
      console.error("Error deleting location:", error);
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
    data: filteredLocations,
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

  const rawPagination = data?.locations ?? defaultPagination;
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
        <div className="flex items-center gap-2">
          <div className="relative w-[300px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search Anything in locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 size-4" />
            Add Address
          </Button>
        </div>
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
