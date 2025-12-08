"use client";

import { usePathname, useRouter } from "next/navigation";
import { Package, List } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const getActiveTab = () => {
    if (pathname === "/orders/bulk") return "bulk";
    if (pathname === "/orders/manage-orders") return "manage-orders";
    return "manage-orders"; // default
  };

  const handleTabChange = (value: string) => {
    if (value === "bulk") {
      router.push("/orders/bulk");
    } else if (value === "manage-orders") {
      router.push("/orders/manage-orders");
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={getActiveTab()} onValueChange={handleTabChange}>
        <TabsList className="bg-muted">
          <TabsTrigger 
            value="manage-orders"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <List className="size-4" />
            <span>Manage Orders</span>
          </TabsTrigger>
          <TabsTrigger 
            value="bulk"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Package className="size-4" />
            <span>Bulk Orders</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      {children}
    </div>
  );
}

