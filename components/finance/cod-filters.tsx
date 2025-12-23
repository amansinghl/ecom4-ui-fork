"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, Download, Wallet, Settings, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DateRangePicker } from "@/components/finance/date-range-picker";
import { downloadCodReports, linkCodToWallet } from "@/api/cod-transactions";
import { toast } from "sonner";
import { ColumnConfigDialog, type ColumnVisibilityConfig, defaultColumnVisibility } from "@/components/finance/column-config-dialog";
import { CodAdjustDialog } from "@/components/finance/cod-adjust-dialog";
import { PartnerType } from "@/api/masters";

// Tracking Status Options
// Note: "all" is used for UI, but should be converted to null when sending to API
const trackingStatusOptions = [
  { label: "All", value: "all" },
  { label: "Booked", value: "booked" },
  { label: "Picked Up", value: "picked_up" },
  { label: "Delivered", value: "delivered" },
  { label: "Lost", value: "lost" },
  { label: "RTO (Transit)", value: "rto_transit" },
  { label: "RTO (Delivered)", value: "rto_delivered" },
];

// COD Status Options
const codStatusOptions = [
  { label: "All Shipments", value: "all" },
  { label: "Undelivered shipments", value: "undelivered" },
  { label: "Remittance Pending", value: "pending" },
  { label: "COD amount initiated", value: "initiated" },
  { label: "Remitted Shipments", value: "remitted" },
  { label: "Ineligible Shipments", value: "Ineligible" },
];

type CodFiltersProps = {
  onFiltersChange?: (filters: {
    trackingStatus: string;
    codStatus: string;
    shipmentNos: string;
    deliveredFromDate: string;
    deliveredToDate: string;
    paymentFromDate: string;
    paymentToDate: string;
    bookingFromDate: string;
    bookingToDate: string;
  }) => void;
  currentSort?: string;
  columnVisibility?: ColumnVisibilityConfig;
  onColumnVisibilityChange?: (visibility: ColumnVisibilityConfig) => void;
  codAdjustable?: boolean;
  partners?: PartnerType[];
  onAdjustSuccess?: () => void;
};

export function CodFilters({ 
  onFiltersChange, 
  currentSort = "shipment_no|desc",
  columnVisibility = defaultColumnVisibility,
  onColumnVisibilityChange,
  codAdjustable = false,
  partners,
  onAdjustSuccess,
}: CodFiltersProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isColumnConfigOpen, setIsColumnConfigOpen] = useState(false);
  const [isCodAdjustOpen, setIsCodAdjustOpen] = useState(false);
  
  // Client-side state only - no URL persistence
  const [trackingStatus, setTrackingStatus] = useState("all");
  const [codStatus, setCodStatus] = useState("all");
  const [shipmentNos, setShipmentNos] = useState("");
  const [deliveredFromDate, setDeliveredFromDate] = useState("");
  const [deliveredToDate, setDeliveredToDate] = useState("");
  const [paymentFromDate, setPaymentFromDate] = useState("");
  const [paymentToDate, setPaymentToDate] = useState("");
  const [bookingFromDate, setBookingFromDate] = useState("");
  const [bookingToDate, setBookingToDate] = useState("");

  // Notify parent component on mount and when filters change
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange({
        trackingStatus,
        codStatus,
        shipmentNos,
        deliveredFromDate,
        deliveredToDate,
        paymentFromDate,
        paymentToDate,
        bookingFromDate,
        bookingToDate,
      });
    }
  }, [trackingStatus, codStatus, shipmentNos, deliveredFromDate, deliveredToDate, paymentFromDate, paymentToDate, bookingFromDate, bookingToDate, onFiltersChange]);

  const handleTrackingStatusChange = (value: string) => {
    setTrackingStatus(value);
  };

  const handleCodStatusChange = (value: string) => {
    setCodStatus(value);
  };


  const handleSearch = () => {
    // Notify parent with all current filter values
    if (onFiltersChange) {
      onFiltersChange({
        trackingStatus,
        codStatus,
        shipmentNos,
        deliveredFromDate,
        deliveredToDate,
        paymentFromDate,
        paymentToDate,
        bookingFromDate,
        bookingToDate,
      });
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      // Step 1: Build params object with all filters
      const params: Record<string, string> = {
        sort: currentSort,
        page: "1",
        per_page: "25",
      };

      // Add tracking status filter
      if (trackingStatus !== "all") {
        params.tracking_status = trackingStatus;
      }

      // Add COD status filter
      if (codStatus !== "all") {
        params.cod_status = codStatus;
      }

      // Add shipment numbers filter
      if (shipmentNos.trim()) {
        params.shipment_nos = shipmentNos.trim();
      }

      // Add date range filters
      if (paymentFromDate && paymentToDate) {
        params.payment_from_date = paymentFromDate;
        params.payment_to_date = paymentToDate;
      }

      if (deliveredFromDate && deliveredToDate) {
        params.delivered_from_date = deliveredFromDate;
        params.delivered_to_date = deliveredToDate;
      }

      if (bookingFromDate && bookingToDate) {
        params.from_date = bookingFromDate;
        params.to_date = bookingToDate;
      }

      // Step 2: Collect visible columns from columnVisibility config (excluding "select")
      const visibleColumns = Object.entries(columnVisibility)
        .filter(([, config]) => config.visibility)
        .map(([key]) => key);

      if (visibleColumns.length > 0) {
        params.fields = visibleColumns.join(",");
      }

      // Step 3: Call API
      const csvContent = await downloadCodReports(params);

      // Step 4: Create and trigger download
      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "cod_shipments.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("CSV file has been downloaded successfully.");
    } catch (error) {
      console.error("Download error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to download CSV file."
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCodAdjust = () => {
    // Set COD status filter to "receivable"
    setCodStatus("receivable");
    
    // Notify parent to update filters
    if (onFiltersChange) {
      onFiltersChange({
        trackingStatus,
        codStatus: "receivable",
        shipmentNos,
        deliveredFromDate,
        deliveredToDate,
        paymentFromDate,
        paymentToDate,
        bookingFromDate,
        bookingToDate,
      });
    }
    
    // Open dialog after a short delay to allow filter to apply
    setTimeout(() => {
      setIsCodAdjustOpen(true);
    }, 100);
  };
  

  const handleAdjustToWallet = async (shipmentNos: number[]) => {
    try {
      await linkCodToWallet(shipmentNos);
      toast.success(
        `Successfully adjusted COD amount to wallet for ${shipmentNos.length} shipment${shipmentNos.length > 1 ? "s" : ""}`
      );
      if (onAdjustSuccess) {
        onAdjustSuccess();
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to adjust COD to wallet"
      );
      throw error;
    }
  };

  const handleColumnConfig = () => {
    setIsColumnConfigOpen(true);
  };

  return (
    <Card className="border-border shadow-sm">
      <CardContent className="pt-6 pb-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b">
            <h3 className="text-base font-semibold text-foreground">
              Select One Or Multiple Filters And Download Data
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={handleDownload} 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 hover:bg-accent transition-colors"
                      disabled={isDownloading}
                    >
                      <Download className="h-4 w-4" />
                      {isDownloading ? "Downloading..." : "Download"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Export COD based on the filters chosen, which can be viewed in a spreadsheet app like Microsoft Excel.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {codAdjustable && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={handleCodAdjust} 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 hover:bg-accent transition-colors"
                      >
                        <Wallet className="h-4 w-4" />
                        COD Adjust to Wallet
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>To adjust COD amount to wallet, please select COD Status (Receivable)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <Button 
                onClick={handleColumnConfig} 
                variant="outline" 
                size="sm" 
                className="gap-2 hover:bg-accent transition-colors"
              >
                <Settings className="h-4 w-4" />
                Column Config
              </Button>
            </div>
          </div>

          {/* Main Filter Section */}
          <div className="grid gap-5 lg:grid-cols-[1fr_1.5fr]">
            {/* Left Column - Status Filters */}
            <div className="space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help shrink-0 hover:text-foreground transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Select tracking status to filter</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Label htmlFor="tracking-status" className="text-sm font-semibold text-foreground">
                    Select Tracking Status
                  </Label>
                </div>
                <Select 
                  value={trackingStatus === "all" ? undefined : trackingStatus} 
                  onValueChange={handleTrackingStatusChange}
                >
                  <SelectTrigger id="tracking-status" className="w-full h-10 border-input shadow-sm hover:border-ring transition-colors">
                    <SelectValue placeholder="Select Tracking Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {trackingStatusOptions.map((option) => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help shrink-0 hover:text-foreground transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Select COD status to filter</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Label htmlFor="cod-status" className="text-sm font-semibold text-foreground">
                    Select COD Status
                  </Label>
                </div>
                <Select value={codStatus === "all" ? undefined : codStatus} onValueChange={handleCodStatusChange}>
                  <SelectTrigger id="cod-status" className="w-full h-10 border-input shadow-sm hover:border-ring transition-colors">
                    <SelectValue placeholder="Select COD Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {codStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Middle Column - Search */}
            <div className="space-y-2.5">
              <Label htmlFor="shipment-nos" className="text-sm font-semibold text-foreground">
                Search Shipment No Seprated by (space, Comma, newline)
              </Label>
              <div className="flex gap-2 items-center">
                <Textarea
                  id="shipment-nos"
                  placeholder="Enter shipment numbers separated by space, comma, or newline"
                  value={shipmentNos}
                  onChange={(e) => setShipmentNos(e.target.value)}
                  rows={3}
                  className="resize-none w-full min-w-[320px] max-w-[500px] text-sm min-h-[80px] border-input shadow-sm focus-visible:ring-ring/50 transition-colors"
                />
                <Button 
                  onClick={handleSearch} 
                  size="sm"
                  className="h-10 px-3 shrink-0 flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <Search className="h-4 w-4" />
                  <span className="text-sm font-medium">Search</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Date Range Filters */}
          <div className="grid gap-4 md:grid-cols-3 pt-4 border-t border-border">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">
                Delivered Date Range
              </Label>
              <DateRangePicker
                fromDate={deliveredFromDate}
                toDate={deliveredToDate}
                onFromDateChange={setDeliveredFromDate}
                onToDateChange={setDeliveredToDate}
                startPlaceholder="Delivered from date"
                endPlaceholder="Delivered to date"
                id="delivered-date-range"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">
                Payment Date Range
              </Label>
              <DateRangePicker
                fromDate={paymentFromDate}
                toDate={paymentToDate}
                onFromDateChange={setPaymentFromDate}
                onToDateChange={setPaymentToDate}
                startPlaceholder="Payment from date"
                endPlaceholder="Payment to date"
                id="payment-date-range"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">
                Booking Date Range
              </Label>
              <DateRangePicker
                fromDate={bookingFromDate}
                toDate={bookingToDate}
                onFromDateChange={setBookingFromDate}
                onToDateChange={setBookingToDate}
                startPlaceholder="Booking from date"
                endPlaceholder="Booking to date"
                id="booking-date-range"
              />
            </div>
          </div>
        </div>
      </CardContent>

      {/* Column Config Dialog */}
      {onColumnVisibilityChange && (
        <ColumnConfigDialog
          open={isColumnConfigOpen}
          onOpenChange={setIsColumnConfigOpen}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={onColumnVisibilityChange}
        />
      )}

      {/* COD Adjust Dialog */}
      <CodAdjustDialog
        open={isCodAdjustOpen}
        onOpenChange={(open) => {
          setIsCodAdjustOpen(open);
          // Reset COD status filter when dialog closes
          if (!open && codStatus === "receivable") {
            setCodStatus("all");
            if (onFiltersChange) {
              onFiltersChange({
                trackingStatus,
                codStatus: "all",
                shipmentNos,
                deliveredFromDate,
                deliveredToDate,
                paymentFromDate,
                paymentToDate,
                bookingFromDate,
                bookingToDate,
              });
            }
          }
        }}
        partners={partners}
        onAdjust={handleAdjustToWallet}
        currentSort={currentSort}
      />
    </Card>
  );
}
