"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { CodTransactionType } from "@/types/cod-transactions";
import { PartnerType } from "@/api/masters";
import { format } from "date-fns";
import { Wallet, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCodTransactions } from "@/hooks/use-cod-transactions";
import { PaginationType } from "@/types/shipments";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const formatCurrency = (amount: string | null | undefined) => {
  if (!amount) return "₹0.00";
  const numAmount = parseFloat(amount);
  return `₹${numAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Helper functions for partner info
const getPartnerLogo = (
  supplierId: number | undefined,
  partners: PartnerType[] | undefined,
): string | undefined => {
  if (!supplierId || !partners) return undefined;
  const partner = partners.find((p) => p.partner_id === supplierId);
  if (!partner?.logo) return undefined;
  
  if (partner.logo.startsWith("http://") || partner.logo.startsWith("https://")) {
    return partner.logo;
  }
  
  const apiBaseUrl = process.env.NEXT_PUBLIC_ECOM3_API_BASE_URL || "";
  let baseUrl = apiBaseUrl.replace("/api/v1/", "").replace("/api/v1", "");
  baseUrl = baseUrl.replace(/\/$/, "");
  
  if (partner.logo.startsWith("/")) {
    return `${baseUrl}${partner.logo}`;
  }
  return `${baseUrl}/${partner.logo}`;
};

const getPartnerName = (
  supplierId: number | undefined,
  partners: PartnerType[] | undefined,
): string => {
  if (!supplierId || !partners) return "";
  const partner = partners.find((p) => p.partner_id === supplierId);
  return partner?.name || "";
};

const PartnerLogo = ({ 
  src, 
  alt 
}: { 
  src: string | undefined; 
  alt: string;
}) => {
  const [imageError, setImageError] = useState(false);
  
  if (!src || imageError) return null;
  
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="h-6 w-6 object-contain rounded-full"
      onError={() => setImageError(true)}
    />
  );
};

type CodAdjustDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partners: PartnerType[] | undefined;
  onAdjust: (shipmentNos: number[]) => Promise<void>;
  currentSort?: string;
};

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

export function CodAdjustDialog({
  open,
  onOpenChange,
  partners,
  onAdjust,
  currentSort = "shipment_no|desc",
}: CodAdjustDialogProps) {
  const [selectedShipments, setSelectedShipments] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  // Fetch receivable shipments when dialog is open
  const receivableParams = useMemo(() => {
    if (!open) return undefined;
    return {
      sort: currentSort,
      page: currentPage.toString(),
      per_page: perPage.toString(),
      cod_status: "receivable",
    };
  }, [open, currentSort, currentPage, perPage]);

  const { data, isLoading } = useCodTransactions(receivableParams);
  
  const receivableTransactions = data?.cod_transactions?.data ?? [];
  const paginationData = data?.cod_transactions ?? defaultPagination;

  // Reset selection when dialog opens/closes
  useEffect(() => {
    if (open) {
      setSelectedShipments(new Set());
      setCurrentPage(1);
    }
  }, [open]);
  
  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= paginationData.last_page) {
      setCurrentPage(page);
    }
  };
  
  const handlePerPageChange = (value: string) => {
    setPerPage(Number(value));
    setCurrentPage(1);
  };

  // Calculate total COD amount
  const totalCodAmount = useMemo(() => {
    return receivableTransactions
      .filter((t) => selectedShipments.has(t.shipment_no))
      .reduce((sum, t) => sum + parseFloat(t.cod_amount || "0"), 0);
  }, [receivableTransactions, selectedShipments]);

  const toggleSelection = (shipmentNo: number) => {
    const newSelection = new Set(selectedShipments);
    if (newSelection.has(shipmentNo)) {
      newSelection.delete(shipmentNo);
    } else {
      newSelection.add(shipmentNo);
    }
    setSelectedShipments(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedShipments.size === receivableTransactions.length) {
      setSelectedShipments(new Set());
    } else {
      setSelectedShipments(new Set(receivableTransactions.map((t) => t.shipment_no)));
    }
  };

  const handleAdjust = async () => {
    if (selectedShipments.size === 0) return;
    
    setIsSubmitting(true);
    try {
      await onAdjust(Array.from(selectedShipments));
      setSelectedShipments(new Set());
      onOpenChange(false);
    } catch (error) {
      console.error("Adjustment failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return format(date, "dd MMM yyyy");
    } catch {
      return "";
    }
  };

  const allSelected = receivableTransactions.length > 0 && 
    selectedShipments.size === receivableTransactions.length;
  const someSelected = selectedShipments.size > 0 && 
    selectedShipments.size < receivableTransactions.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Adjust COD Amount to Wallet
          </DialogTitle>
          <DialogDescription className="text-sm">
            Select receivable shipments to adjust COD amounts to your wallet. Only shipments with "Adjustable" status can be selected.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Selection Summary and Pagination */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={allSelected}
                  ref={(el) => {
                    if (el) {
                      el.indeterminate = someSelected;
                    }
                  }}
                  onCheckedChange={toggleSelectAll}
                />
                <div>
                  <p className="text-sm font-medium">
                    {selectedShipments.size > 0
                      ? `${selectedShipments.size} shipment${selectedShipments.size > 1 ? "s" : ""} selected`
                      : "No shipments selected"}
                  </p>
                  {totalCodAmount > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Total amount: {formatCurrency(totalCodAmount.toString())}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Selected: {selectedShipments.size}
                </span>
                {totalCodAmount > 0 && (
                  <Badge variant="default" className="font-semibold text-base px-3 py-1">
                    {formatCurrency(totalCodAmount.toString())}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Pagination */}
            {paginationData.total > 0 && (
              <div className="flex items-center justify-between gap-4 p-2 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Go to</span>
                  <Input
                    type="number"
                    min={1}
                    max={paginationData.last_page}
                    value={currentPage}
                    onChange={(e) => {
                      const page = parseInt(e.target.value);
                      if (!isNaN(page)) {
                        handlePageChange(page);
                      }
                    }}
                    className="w-16 h-8 text-center"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                  >
                    ‹
                  </Button>
                  {Array.from({ length: Math.min(5, paginationData.last_page) }, (_, i) => {
                    let pageNum;
                    if (paginationData.last_page <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= paginationData.last_page - 2) {
                      pageNum = paginationData.last_page - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        disabled={isLoading}
                        className="min-w-[32px]"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === paginationData.last_page || isLoading}
                  >
                    ›
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Select value={perPage.toString()} onValueChange={handlePerPageChange}>
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">/page</span>
                </div>
                
                <span className="text-sm text-muted-foreground">
                  Total {paginationData.total}
                </span>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto border rounded-lg">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : receivableTransactions.length > 0 ? (
              <Table>
                <TableHeader className="bg-muted sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={allSelected}
                        ref={(el) => {
                          if (el) {
                            el.indeterminate = someSelected;
                          }
                        }}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="min-w-[120px]">Shipment No.</TableHead>
                    <TableHead className="min-w-[120px]">AWB No.</TableHead>
                    <TableHead className="min-w-[100px]">Partner</TableHead>
                    <TableHead className="min-w-[120px]">Delivered On</TableHead>
                    <TableHead className="min-w-[120px]">COD Amount</TableHead>
                    <TableHead className="min-w-[120px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receivableTransactions.map((transaction) => {
                    const isSelected = selectedShipments.has(transaction.shipment_no);
                    const isAdjustable = transaction.status === 1;
                    const partnerLogo = getPartnerLogo(transaction.supplier_id, partners);
                    const partnerName = getPartnerName(transaction.supplier_id, partners);

                    return (
                      <TableRow
                        key={transaction.shipment_no}
                        className={cn(
                          "cursor-pointer",
                          isSelected && "bg-primary/5",
                          !isAdjustable && "opacity-50"
                        )}
                        onClick={() => isAdjustable && toggleSelection(transaction.shipment_no)}
                      >
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelection(transaction.shipment_no)}
                            disabled={!isAdjustable}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-sm font-semibold">
                          {transaction.shipment_no}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {transaction.awb_no || ""}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <PartnerLogo src={partnerLogo} alt={partnerName} />
                            <span className="text-sm">{partnerName || ""}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(transaction.delivered_date)}
                        </TableCell>
                        <TableCell className="text-sm font-semibold">
                          {formatCurrency(transaction.cod_amount)}
                        </TableCell>
                        <TableCell>
                          {isAdjustable ? (
                            <Badge variant="default" className="text-xs">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Adjustable
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              <XCircle className="h-3 w-3 mr-1" />
                              Payment on process
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center p-8">
                <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm font-medium text-foreground">
                  No receivable shipments found
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Only shipments with "Receivable" COD status can be adjusted to wallet
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdjust}
            disabled={selectedShipments.size === 0 || isSubmitting}
            className="min-w-[180px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Add to Wallet {totalCodAmount > 0 && `(${formatCurrency(totalCodAmount.toString())})`}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

