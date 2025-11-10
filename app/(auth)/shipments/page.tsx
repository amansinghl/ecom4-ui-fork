"use client";

import { useEffect, useState } from "react";
import useUserStore from "@/store/user";
import { getShipments } from "@/api/shipments";

import { useSearchParams } from "next/navigation";

import { columns } from "@/components/shipments/columns";
import { DataTable } from "@/components/shipments/data-table";
import { PaginationType } from "@/types/shipments";
import { decoratePagination } from "@/decorators/pagination";
import { formatQueryString } from "@/lib/client_utils";

import { usePathname } from "next/navigation";

const Shipments = () => {
  const params = useSearchParams();
  const [shipments, setShipments] = useState([]);
  const [pagination, setPagination] = useState<PaginationType>({
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
  });
  const { token, logout } = useUserStore();
  const pathname = usePathname();

  useEffect(() => {
    if (token) {
      getShipments(token, formatQueryString(params ? "" + params : ""))
        .then((shipmentsData) => {
          if (shipmentsData?.meta?.status_code === 200) {
            setShipments(shipmentsData?.data?.shipments?.data);
            const shipmentPagintion = decoratePagination(
              shipmentsData?.data?.shipments,
              pathname,
            );
            setPagination(shipmentPagintion);
          }
        })
        .catch(() => {
          logout();
        });
    }
  }, [token, logout, params]);
  return (
    <DataTable columns={columns} pagination={pagination} data={shipments} />
  );
};

export default Shipments;
