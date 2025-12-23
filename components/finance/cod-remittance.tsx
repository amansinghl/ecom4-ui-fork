"use client";

import { useState, useMemo } from "react";
import { useCodRemittance } from "@/hooks/use-cod-remittance";
import { getCodRemittanceDetails, downloadCodRemittanceReport, downloadCodRemittanceConsolidated } from "@/api/cod-transactions";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DateRangePicker } from "@/components/finance/date-range-picker";
import { Label } from "@/components/ui/label";
import CustomPagination from "@/components/pagination";
import { decoratePagination } from "@/decorators/pagination";
import { PaginationType } from "@/types/shipments";
import { CodRemittanceBatch, CodRemittanceShipment } from "@/types/cod-remittance";
import { Download, ChevronDown, ChevronRight, Loader2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

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

// Format amount with Indian number system
const formatAmount = (amount: string | null | undefined): string => {
  if (!amount) return "0";
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) return "0";
  return numAmount.toLocaleString("en-IN");
};

// Convert to IST date format
const convertToISTDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = format(date, "MMM");
    const year = format(date, "yyyy");
    const time = format(date, "hh:mm a");
    
    // Add ordinal suffix
    const getOrdinal = (n: number) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };
    
    return `${getOrdinal(day)} ${month} ${year} ${time}`;
  } catch {
    return "";
  }
};

// Format payment date
const formatPaymentDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = format(date, "MMM");
    const year = format(date, "yyyy");
    
    const getOrdinal = (n: number) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };
    
    return `${getOrdinal(day)} ${month} ${year}`;
  } catch {
    return "";
  }
};

// Get COD status text
const getCodStatusText = (status: number): string => {
  switch (status) {
    case 0:
      return "Pending";
    case 1:
    case 2:
      return "Receivable";
    case 3:
      return "Received";
    case 4:
      return "Cod Cancelled";
    default:
      return "Unknown";
  }
};

// Get COD status variant
const getCodStatusVariant = (status: number): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 3:
      return "default";
    case 0:
      return "secondary";
    case 4:
      return "destructive";
    default:
      return "outline";
  }
};

export function CodRemittance() {
  const params = useSearchParams();
  const pathname = usePathname();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingBatchId, setDownloadingBatchId] = useState<string | null>(null);

  // Build query params
  const queryParams = useMemo(() => {
    const p: Record<string, string> = {
      sort: params.get("sort") || "shipment_no|desc",
      page: params.get("page") || "1",
      per_page: params.get("per_page") || "25",
    };
    if (fromDate) p.from_date = fromDate;
    if (toDate) p.to_date = toDate;
    return p;
  }, [params, fromDate, toDate]);

  const { data, isLoading, error } = useCodRemittance(queryParams);

  // Fetch details for expanded rows
  const expandedBatchIds = Array.from(expandedRows);
  const { data: detailsData, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["cod-remittance-details", expandedBatchIds],
    queryFn: () => getCodRemittanceDetails(expandedBatchIds),
    enabled: expandedBatchIds.length > 0,
  });

  const batches = data?.cod_transactions?.data ?? [];
  const rawPagination = data?.cod_transactions ?? defaultPagination;
  const pagination = decoratePagination(rawPagination, pathname, params.toString());

  const toggleRowExpansion = (batchId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(batchId)) {
      newExpanded.delete(batchId);
    } else {
      newExpanded.add(batchId);
    }
    setExpandedRows(newExpanded);
  };

  const handleDownloadBatch = async (batchId: string) => {
    try {
      setDownloadingBatchId(batchId);
      const csvContent = await downloadCodRemittanceReport(batchId, queryParams);
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `cod_remittance_${batchId}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("CSV report downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to download CSV report"
      );
    } finally {
      setDownloadingBatchId(null);
    }
  };

  const handleDownloadConsolidated = async () => {
    try {
      setIsDownloading(true);
      const blob = await downloadCodRemittanceConsolidated(queryParams);
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `cod_remittance_consolidated.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Consolidated CSV report downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to download consolidated CSV"
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const getShipmentDetails = (batchId: string): CodRemittanceShipment[] => {
    return detailsData?.cod_remittance_details?.[batchId] ?? [];
  };

  if (isLoading || error) {
    return <h1>Loading...</h1>;
  }

  return (
    <div>
      {/* Filters */}
      <Card className="border-border shadow-sm mb-6">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-end gap-3 flex-wrap">
            <div className="w-[280px]">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Date Range
                </Label>
                <DateRangePicker
                  fromDate={fromDate}
                  toDate={toDate}
                  onFromDateChange={setFromDate}
                  onToDateChange={setToDate}
                  startPlaceholder="From date"
                  endPlaceholder="To date"
                  id="remittance-date-range"
                />
              </div>
            </div>
            <Button
              onClick={handleDownloadConsolidated}
              disabled={isDownloading}
              size="sm"
              className="gap-2 shrink-0"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  Download Consolidated CSV
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <CustomPagination {...pagination} endpoint="/finance?tabLevel1=cod_remittance" />
      {/* Table */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead className="min-w-[180px]">Remittance Batch ID</TableHead>
              <TableHead className="min-w-[180px]">Initiated At</TableHead>
              <TableHead className="min-w-[140px]">Payment Date</TableHead>
              <TableHead className="min-w-[160px]">Estimated COD Amount</TableHead>
              <TableHead className="min-w-[140px]">Report Download</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches.length > 0 ? (
              batches.map((batch) => {
                const isExpanded = expandedRows.has(batch.remittance_batch_id);
                const shipmentDetails = getShipmentDetails(batch.remittance_batch_id);
                const isLoadingShipments = isLoadingDetails && isExpanded;

                return (
                  <>
                    <TableRow
                      key={batch.remittance_batch_id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleRowExpansion(batch.remittance_batch_id)}
                    >
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRowExpansion(batch.remittance_batch_id);
                          }}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-mono text-sm font-semibold">
                        {batch.remittance_batch_id}
                      </TableCell>
                      <TableCell className="text-sm">
                        {convertToISTDate(batch.initiated_at)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatPaymentDate(batch.payment_date)}
                      </TableCell>
                      <TableCell className="text-sm font-semibold">
                        ₹{formatAmount(batch.cod_amount)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadBatch(batch.remittance_batch_id);
                          }}
                          disabled={downloadingBatchId === batch.remittance_batch_id}
                        >
                          {downloadingBatchId === batch.remittance_batch_id ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Exporting...
                            </>
                          ) : (
                            <>
                              <Download className="h-3 w-3" />
                              Export to CSV
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={6} className="p-0 bg-muted/30">
                          {isLoadingShipments ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                          ) : shipmentDetails.length > 0 ? (
                            <div className="p-4">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Shipment No</TableHead>
                                    <TableHead>COD Amount</TableHead>
                                    <TableHead>Paid Amount</TableHead>
                                    <TableHead>Payment Ref No</TableHead>
                                    <TableHead>Payment Date</TableHead>
                                    <TableHead>Delivered Date</TableHead>
                                    <TableHead>COD Status</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {shipmentDetails.map((shipment, idx) => (
                                    <TableRow key={`${shipment.shipment_no}-${idx}`}>
                                      <TableCell className="font-mono text-sm font-semibold">
                                        {shipment.shipment_no}
                                      </TableCell>
                                      <TableCell className="text-sm font-semibold">
                                        ₹{formatAmount(shipment.cod_amount)}
                                      </TableCell>
                                      <TableCell className="text-sm">
                                        ₹{formatAmount(shipment.paid_amount)}
                                      </TableCell>
                                      <TableCell className="font-mono text-sm">
                                        {shipment.payment_ref_no || ""}
                                      </TableCell>
                                      <TableCell className="text-sm">
                                        {formatPaymentDate(shipment.payment_date)}
                                      </TableCell>
                                      <TableCell className="text-sm">
                                        {shipment.delivered_date
                                          ? format(new Date(shipment.delivered_date), "dd MMM yyyy HH:mm")
                                          : ""}
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant={getCodStatusVariant(shipment.status)}>
                                          {getCodStatusText(shipment.status)}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          ) : (
                            <div className="py-8 text-center text-sm text-muted-foreground">
                              No shipment details found
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-3 text-center">
                  <div>No data available.</div>
                  <div className="text-sm text-secondary-foreground font-semibold">
                    Hint: You might wanna check the filters or the other search
                    criteria.
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <CustomPagination {...pagination} endpoint="/finance?tabLevel1=cod_remittance" />
    </div>
  );
}

