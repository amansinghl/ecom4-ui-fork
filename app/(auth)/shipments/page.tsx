"use client";

import { useSearchParams, usePathname, redirect, RedirectType } from "next/navigation";
import { useShipments } from "@/hooks/use-shipments";
import { columns } from "@/components/shipments/columns";
import { DataTable } from "@/components/shipments/data-table";
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
  const rawPagination = data?.data?.shipments ?? defaultPagination;
  const pagination = decoratePagination(rawPagination, pathname);

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

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error loading shipments</div>;

  return (
    <DataTable
      changePageSize={changePageSize}
      columns={columns}
      pagination={pagination}
      data={shipments}
    />
  );
}
