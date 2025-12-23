"use client";

import { SectionCards } from "@/components/dashboard/section-cards";
import { ShipmentChart } from "@/components/dashboard/shipment-chart";

export default function Dashboard() {
  return (
    <div className="@container/main space-y-6">
      <SectionCards />
      <ShipmentChart />
    </div>
  );
}

