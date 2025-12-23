"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { type DateRange } from "react-day-picker";
import { useBranches } from "@/hooks/use-user";
import { useLocations } from "@/hooks/use-locations";
import { useOrders } from "@/hooks/use-orders";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { checkBulkServiceability, getManageOrdersQuote, getOrderLineItems, getOrderRisks, getOrderAddresses, type LineItem } from "@/api/orders";
import type { OrderType } from "@/types/orders";
import type { QuoteResponseData } from "@/types/quick-ship";
import { transformOrdersToQuoteRequest, fixOrderWeights } from "@/transformers/quote-request";
import { QuoteDisplay } from "@/components/quick-ship/quote-display";
import { toast } from "sonner";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { createColumns } from "@/components/orders/columns";
import { StatsAndOptions } from "@/components/orders/stats-and-options";
import { Filters } from "@/components/orders/filters";
import { OrderDetailsSheet } from "@/components/orders/order-details-sheet";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import type { LocationType } from "@/types/locations";
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


const ManageOrders = () => {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [transportMode, setTransportMode] = useState<"express" | "surface" | "">("express");
  const [businessType, setBusinessType] = useState<"b2c" | "b2b" | "">("");
  const [selectedGstBranch, setSelectedGstBranch] = useState<string>("");
  const [selectedOriginAddress, setSelectedOriginAddress] = useState<string>("");

  const [orderSearch, setOrderSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string[]>(["created", "processing", "partially fulfilled"]);
  
  const getDefaultDateRange = (): DateRange => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    return {
      from: thirtyDaysAgo,
      to: today,
    };
  };
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>(getDefaultDateRange());
  const [storeFilter, setStoreFilter] = useState<string[]>([]);
  const [paymentModeFilter, setPaymentModeFilter] = useState<string[]>([]);
  const [channelFilter, setChannelFilter] = useState<string[]>([]);
  
  const [serviceableOrderIds, setServiceableOrderIds] = useState<Set<number>>(new Set());
  const [isCheckingServiceability, setIsCheckingServiceability] = useState(false);
  
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [quoteData, setQuoteData] = useState<QuoteResponseData | null>(null);
  
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isClosingRef = useRef(false);
  const lastClosedOrderIdRef = useRef<number | null>(null);

  // Ensure charts only render on client to enable animations
  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: branchesData, isLoading: branchesLoading } = useBranches();
  const { data: locationsData, isLoading: locationsLoading } = useLocations();

  const branches = branchesData?.branches ?? [];
  const locations = locationsData?.locations?.data ?? [];

  const apiParams = useMemo(() => {
    const filterParams: Record<string, string> = {
      sort: "order_date|desc",
      page: "1",
      per_page: "100",
    };
    
    if (orderSearch) {
      filterParams.search = orderSearch;
    }
    
    if (statusFilter.length > 0) {
      const statusMap: Record<string, string> = {
        "created": "Created",
        "processing": "Processing",
        "partially fulfilled": "Partially Fulfilled",
        "cancelled": "Cancelled",
        "on hold": "On Hold",
        "cancel requested": "Cancel requested",
        "shipped": "Shipped",
        "fulfilled": "Fulfilled",
      };
      filterParams.status = statusFilter
        .map((s) => statusMap[s.toLowerCase()] || s)
        .join(",");
    }
    
    if (paymentModeFilter.length > 0) {
      filterParams.payment_type = paymentModeFilter.join(",");
    }
    
    if (channelFilter.length > 0) {
      filterParams.channel = channelFilter.join(",");
    }
    
    if (dateRange?.from) {
      filterParams.from_date = dateRange.from.toISOString().split("T")[0];
    }
    
    if (dateRange?.to) {
      filterParams.to_date = dateRange.to.toISOString().split("T")[0];
    }
    
    const urlParams = Object.fromEntries(params.entries());
    return { ...filterParams, ...urlParams };
  }, [orderSearch, statusFilter, paymentModeFilter, channelFilter, dateRange, params]);

  const { data, isLoading, error } = useOrders(apiParams);
  const orders = data?.orders?.data ?? [];
  const defaultPackage = data?.defaultPackage ?? null;

  const ordersKey = useMemo(() => {
    return orders.map((o) => `${o.id}:${o.dest_pincode}:${o.cod_value}`).join(",");
  }, [orders]);

  // Open sheet if orderId is in URL
  useEffect(() => {
    // Don't open if we're in the process of closing
    if (isClosingRef.current) {
      return;
    }
    
    const orderIdParam = params.get("orderId");
    
    // If there's no orderId in URL, don't do anything
    if (!orderIdParam) {
      return;
    }
    
    const orderId = parseInt(orderIdParam, 10);
    
    // Don't open if this is the order we just closed
    if (!isNaN(orderId) && lastClosedOrderIdRef.current === orderId) {
      return;
    }
    
    // Only open if sheet is not already open and we have orders loaded
    if (orders.length > 0 && !isLoading && !isSheetOpen) {
      if (!isNaN(orderId)) {
        const order = orders.find((o) => o.id === orderId);
        // Only set if order exists and it's different from current selection
        if (order && (!selectedOrder || selectedOrder.id !== orderId)) {
          setSelectedOrder(order);
          setIsSheetOpen(true);
        }
      }
    }
  }, [params, orders, isLoading, isSheetOpen, selectedOrder]);

  const originPincode = useMemo(() => {
    if (!selectedOriginAddress) return null;
    const selectedLocation = locations.find((loc) => loc.id === selectedOriginAddress);
    return selectedLocation?.pincode || null;
  }, [selectedOriginAddress, locations]);

  useEffect(() => {
    const calculateServiceability = async () => {
      if (!originPincode || !orders.length) {
        setServiceableOrderIds(new Set());
        return;
      }

      let shipmentType: "express" | "b2c" | "b2b" = "express";
      if (transportMode === "surface" && businessType === "b2c") {
        shipmentType = "b2c";
      } else if (transportMode === "surface" && businessType === "b2b") {
        shipmentType = "b2b";
      }

      const destinationPincodes = orders.reduce<{ cod: Set<string>; prepaid: Set<string> }>(
        (result, order) => {
          const codValue = Number(order.cod_value ?? 0);
          const pincode = order.dest_pincode;
          
          if (!pincode) return result;
          
          if (codValue > 0) {
            result.cod.add(pincode);
          } else {
            result.prepaid.add(pincode);
          }
          
          return result;
        },
        { cod: new Set(), prepaid: new Set() }
      );

      if (destinationPincodes.cod.size === 0 && destinationPincodes.prepaid.size === 0) {
        setServiceableOrderIds(new Set());
        return;
      }

      setIsCheckingServiceability(true);
      try {
        const response = await checkBulkServiceability({
          origin: originPincode,
          destinations: {
            cod: Array.from(destinationPincodes.cod),
            prepaid: Array.from(destinationPincodes.prepaid),
          },
          shipment_type: shipmentType,
        });

        const serviceableIds = new Set<number>();
        orders.forEach((order) => {
          const codValue = Number(order.cod_value ?? 0);
          const pincode = order.dest_pincode;
          
          if (!pincode) return;
          
          if (codValue > 0 && response.cod.includes(pincode)) {
            serviceableIds.add(order.id);
          } else if (codValue === 0 && response.prepaid.includes(pincode)) {
            serviceableIds.add(order.id);
          }
        });

        setServiceableOrderIds(serviceableIds);
      } catch (error) {
        console.error("Error checking serviceability:", error);
        setServiceableOrderIds(new Set());
      } finally {
        setIsCheckingServiceability(false);
      }
    };

    calculateServiceability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originPincode, transportMode, businessType, ordersKey]);

  const handleOrderClick = useCallback((order: OrderType) => {
    setSelectedOrder(order);
    setIsSheetOpen(true);
    // Update URL with orderId
    const newParams = new URLSearchParams(params.toString());
    newParams.set("orderId", order.id.toString());
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
  }, [params, pathname, router]);

  const handleSheetClose = useCallback(() => {
    // Track which order we're closing
    if (selectedOrder) {
      lastClosedOrderIdRef.current = selectedOrder.id;
    }
    isClosingRef.current = true;
    setIsSheetOpen(false);
    setSelectedOrder(null);
    // Remove orderId from URL
    const newParams = new URLSearchParams(params.toString());
    newParams.delete("orderId");
    const newUrl = newParams.toString() ? `${pathname}?${newParams.toString()}` : pathname;
    router.replace(newUrl, { scroll: false });
    // Reset the ref after URL update completes
    setTimeout(() => {
      isClosingRef.current = false;
      lastClosedOrderIdRef.current = null;
    }, 300);
  }, [params, pathname, router, selectedOrder]);

  const tableColumns = useMemo(
    () => createColumns(defaultPackage, serviceableOrderIds, !!selectedOriginAddress, handleOrderClick),
    [defaultPackage, serviceableOrderIds, selectedOriginAddress, handleOrderClick]
  );

  const table = useReactTable({
    data: orders,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    initialState: {
      columnPinning: {
        left: ["select", "order_info", "status", "actions"],
      },
      pagination: {
        pageSize: 100,
      },
      sorting: [
        {
          id: "order_info",
          desc: true,
        },
      ],
    },
  });

  const rawPagination = data?.orders ?? defaultPagination;
  const pagination = decoratePagination(
    rawPagination,
    pathname,
    params.toString(),
  );

  const handleBackToForm = () => {
    setQuoteData(null);
  };

  const formatFullAddress = (location: LocationType): string => {
    const parts = [
      location.address_line_1,
      location.address_line_2,
      location.city,
      location.state,
      location.pincode,
      location.country,
    ].filter(Boolean);
    return parts.join(", ");
  };

  const formatBranchName = (branch: { branch: string; gst_number: string }) => {
    return branch.gst_number !== "UNKNOWN"
      ? `${branch.branch} (${branch.gst_number})`
      : branch.branch;
  };

  const formatDate = (date: Date | undefined): string => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const handleViewQuote = async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    
    if (selectedRows.length === 0) {
      toast.error("Please select at least one order");
      return;
    }
    
    if (!selectedOriginAddress) {
      toast.error("Please select an origin address");
      return;
    }
    
    if (!selectedGstBranch) {
      toast.error("Please select a GST branch");
      return;
    }
    
    if (!transportMode) {
      toast.error("Please select a transport mode");
      return;
    }
    
    if (transportMode === "surface" && !businessType) {
      toast.error("Please select a business type (B2C or B2B)");
      return;
    }
    
    if (!defaultPackage) {
      toast.error("Default package information is required");
      return;
    }
    
    const originLocation = locations.find((loc) => loc.id === selectedOriginAddress);
    if (!originLocation) {
      toast.error("Origin location not found");
      return;
    }
    
    const selectedOrders = selectedRows.map((row) => row.original);
    
    try {
      setIsLoadingQuote(true);
      
      const orderIds = selectedOrders.map((order) => order.id);
      
      const [lineItemsResponse, risksResponse, addressesResponse] = await Promise.all([
        getOrderLineItems(orderIds),
        getOrderRisks(orderIds),
        getOrderAddresses(orderIds),
      ]);
      
      const lineItems = lineItemsResponse.line_items || {};
      const orderRisks = risksResponse || {};
      const addresses = addressesResponse.addresses || {};
      
      const enrichedOrders = selectedOrders.map((order) => {
        const orderIdStr = order.id.toString();
        return {
          ...order,
          risks: orderRisks[orderIdStr] || null,
          address: addresses[orderIdStr] || null,
        };
      });
      
      const ordersWithFixedWeights = fixOrderWeights(enrichedOrders, lineItems);
      
      const quoteRequest = transformOrdersToQuoteRequest(
        ordersWithFixedWeights,
        originLocation,
        transportMode,
        businessType,
        selectedGstBranch,
        defaultPackage,
        lineItems,
      );
      
      const quoteResponse = await getManageOrdersQuote(quoteRequest);
      
      setQuoteData(quoteResponse);
      toast.success(`Quote generated for ${selectedOrders.length} order(s)`);
    } catch (error) {
      console.error("Error generating quote:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate quote");
    } finally {
      setIsLoadingQuote(false);
    }
  };

  const handleQuickShip = () => {
    console.log("Quick Ship clicked", {
      transportMode,
      businessType,
      selectedGstBranch,
      selectedOriginAddress,
    });
  };

  if (quoteData?.orders && quoteData.orders.length > 0) {
    return (
      <div className="min-h-[calc(100vh-8rem)] py-6">
        <QuoteDisplay quoteData={quoteData} onBackToForm={handleBackToForm} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* <div>
        <h1 className="text-2xl font-semibold">Manage Orders</h1>
        <p className="text-muted-foreground text-sm">
          Select options and convert orders to shipments
        </p>
      </div> */}

      <StatsAndOptions
        mounted={mounted}
        transportMode={transportMode}
        setTransportMode={setTransportMode}
        businessType={businessType}
        setBusinessType={setBusinessType}
        selectedGstBranch={selectedGstBranch}
        setSelectedGstBranch={setSelectedGstBranch}
        selectedOriginAddress={selectedOriginAddress}
        setSelectedOriginAddress={setSelectedOriginAddress}
        branches={branches}
        branchesLoading={branchesLoading}
        locations={locations}
        locationsLoading={locationsLoading}
        isLoadingQuote={isLoadingQuote}
        onViewQuote={handleViewQuote}
        onQuickShip={handleQuickShip}
        formatBranchName={formatBranchName}
        formatFullAddress={formatFullAddress}
      />

      <Separator />

      <Filters
        orderSearch={orderSearch}
        setOrderSearch={setOrderSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        dateRange={dateRange}
        setDateRange={setDateRange}
        paymentModeFilter={paymentModeFilter}
        setPaymentModeFilter={setPaymentModeFilter}
        channelFilter={channelFilter}
        setChannelFilter={setChannelFilter}
        storeFilter={storeFilter}
        setStoreFilter={setStoreFilter}
        formatDate={formatDate}
      />

      <div className="overflow-hidden rounded-md border">
        {isLoading ? (
          <div className="py-8 text-center">
            <div>Loading orders...</div>
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <div className="text-destructive">Error loading orders</div>
          </div>
        ) : orders?.length > 0 ? (
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
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="py-3 text-center">
            <div>No orders to display</div>
            <div className="text-sm text-secondary-foreground font-semibold">
              Hint: You might wanna check the filters or the other search
              criteria.
            </div>
          </div>
        )}
      </div>
      <CustomPagination {...pagination} endpoint="/orders/manage-orders" />
      
      <OrderDetailsSheet
        order={selectedOrder}
        open={isSheetOpen}
        onClose={handleSheetClose}
        onOrderUpdate={(updatedOrder) => {
          setSelectedOrder(updatedOrder);
          // Optionally refresh the orders list here if needed
        }}
      />
    </div>
  );
};

export default ManageOrders;
