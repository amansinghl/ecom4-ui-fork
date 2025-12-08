"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const Orders = () => {
  const router = useRouter();

  // Redirect /orders to /orders/manage-orders as default
  useEffect(() => {
    router.replace("/orders/manage-orders");
  }, [router]);

  return null;
};

export default Orders;
