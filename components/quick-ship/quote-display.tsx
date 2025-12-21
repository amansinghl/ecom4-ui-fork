"use client";

import { useState, useMemo } from "react";
import { QuoteResponseData, QuoteData, OrderQuote } from "@/types/quick-ship";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Receipt,
  ArrowLeft,
  Wallet,
  Truck,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface QuoteDisplayProps {
  quoteData: QuoteResponseData;
  onBackToForm: () => void;
}

type OrderSelection = {
  orderIndex: number;
  supplierId: string;
};

export function QuoteDisplay({ quoteData, onBackToForm }: QuoteDisplayProps) {
  const [selectedOrder, setSelectedOrder] = useState<OrderSelection>({
    orderIndex: 0,
    supplierId: Object.keys(quoteData.orders[0])[0],
  });

  const [orderSelections, setOrderSelections] = useState<Record<number, string>>(
    () => {
      const initial: Record<number, string> = {};
      quoteData.orders.forEach((order, index) => {
        const primarySupplierId = Object.keys(order)[0];
        initial[index] = primarySupplierId;
      });
      return initial;
    }
  );

  const getAvailableQuotesForOrder = (orderIndex: number) => {
    const order = quoteData.orders[orderIndex];
    const primarySupplierId = Object.keys(order).find(key => key !== 'other_quotes' && key !== 'quote_id') || '';
    const primaryQuote = order[primarySupplierId];
    
    const otherQuotes = (order as any).other_quotes || {};

    return {
      [primarySupplierId]: primaryQuote,
      ...otherQuotes,
    };
  };

  const currentQuote = useMemo(() => {
    if (selectedOrder.orderIndex === undefined || !selectedOrder.supplierId) return null;
    const availableQuotes = getAvailableQuotesForOrder(selectedOrder.orderIndex);
    const quote = availableQuotes[selectedOrder.supplierId];
    return quote || null;
  }, [selectedOrder.orderIndex, selectedOrder.supplierId, quoteData.orders]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleCreateShipment = () => {
    toast.success("Create Shipment functionality will be implemented soon");
  };

  const handleAddMoneyToWallet = () => {
    toast.success("Add Money to Wallet functionality will be implemented soon");
  };

  const quoteBreakdown = useMemo(() => {
    if (!currentQuote) {
      return {
        chargeHeads: {},
        totalCost: 0,
        totalWithoutGst: 0,
        volumetricWeight: 0,
        freight: 0,
        fuelSurcharge: 0,
      };
    }

    const chargeHeads = currentQuote?.quote?.charge_heads || {};
    const totalCost = currentQuote?.total_cost || currentQuote?.quote?.total_cost || 0;
    const totalWithoutGst =
      currentQuote?.quote?.total_without_tax ||
      currentQuote?.total_without_tax ||
      0;
    const volumetricWeight =
      currentQuote?.volumetric_weight || currentQuote?.quote?.volumetric_weight || 0;
    const freight = chargeHeads.freight || 0;
    const fuelSurcharge = chargeHeads.fuel_surcharge || 0;

    return {
      chargeHeads,
      totalCost,
      totalWithoutGst,
      volumetricWeight,
      freight,
      fuelSurcharge,
    };
  }, [currentQuote]);

  const { chargeHeads, totalCost, totalWithoutGst, volumetricWeight, freight, fuelSurcharge } = quoteBreakdown;

  const handleOrderQuoteChange = (orderIndex: number, supplierId: string) => {
    setOrderSelections((prev) => ({
      ...prev,
      [orderIndex]: supplierId,
    }));
    setSelectedOrder({ orderIndex, supplierId });
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-background via-background to-muted/30 shadow-sm">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,hsl(var(--primary)/0.03)_50%,transparent_100%)] opacity-50" />
        <div className="relative p-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBackToForm}
                className="h-9 w-9 shrink-0 hover:bg-accent transition-colors rounded-lg"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 shadow-sm border border-primary/10 shrink-0">
                  <Receipt className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xl font-semibold tracking-tight mb-1.5">
                    Quote Generated Successfully
                  </CardTitle>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Review and select your preferred shipping partner for each shipment
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Booking Reference
              </div>
              <Badge
                variant="default"
                className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground shadow-sm hover:shadow-md transition-shadow"
              >
                {quoteData.booking_reference_no}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">
                    Shipping Partners
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    {quoteData.orders.length} shipment{quoteData.orders.length > 1 ? "s" : ""} • Click row to view details
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[calc(100vh-22rem)] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10 border-b">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-12 text-center">#</TableHead>
                      <TableHead className="w-20 text-center">Recommended</TableHead>
                      <TableHead>Partner</TableHead>
                      <TableHead className="text-right w-32">Cost</TableHead>
                      <TableHead className="w-32">Reference 1</TableHead>
                      <TableHead className="w-32">EDD</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quoteData.orders.map((order, orderIndex) => {
                      const availableQuotes = getAvailableQuotesForOrder(orderIndex);
                      const primarySupplierId = Object.keys(order).find(key => key !== 'other_quotes' && key !== 'quote_id') || '';
                      const selectedSupplierId = orderSelections[orderIndex] || primarySupplierId;
                      const selectedQuote = availableQuotes[selectedSupplierId];

                      // Sort quotes for dropdown
                      const sortedQuotes = (Object.entries(availableQuotes) as [string, QuoteData][]).sort(([a], [b]) => {
                        const aNum = parseInt(a);
                        const bNum = parseInt(b);
                        if (!isNaN(aNum) && !isNaN(bNum)) {
                          return aNum - bNum;
                        }
                        return a.localeCompare(b);
                      });

                      const quoteCost = selectedQuote?.total_cost || selectedQuote?.quote?.total_cost || 0;
                      const quoteEDD = selectedQuote?.estimated_delivery_date || selectedQuote?.quote?.estimated_delivery_date || "";
                      const isSelected = selectedOrder.orderIndex === orderIndex;

                      return (
                        <TableRow
                          key={orderIndex}
                          className={`cursor-pointer transition-all ${
                            isSelected 
                              ? "bg-primary/5 border-l-4 border-l-primary" 
                              : "hover:bg-muted/30"
                          }`}
                          onClick={() => setSelectedOrder({ orderIndex, supplierId: selectedSupplierId })}
                        >
                          <TableCell className="text-center font-medium text-muted-foreground">
                            {orderIndex + 1}
                          </TableCell>
                          <TableCell className="text-center">
                            {selectedSupplierId === primarySupplierId ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div onClick={(e) => e.stopPropagation()}>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button className="flex items-center gap-2 transition-all hover:opacity-80">
                                    <Avatar className="h-9 w-9 border-2 border-border hover:border-primary transition-colors">
                                      <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-primary/20 to-primary/10">
                                        {selectedSupplierId}
                                      </AvatarFallback>
                                    </Avatar>
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-4" align="start" side="right">
                                  <div className="space-y-3">
                                    <div className="text-sm font-semibold text-foreground">
                                      Select Shipping Partner
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                      {sortedQuotes.map(([supplierId, quote]) => {
                                        const isSelectedInPopover = selectedSupplierId === supplierId;
                                        const isPrimary = supplierId === primarySupplierId;
                                        const qCost = quote.total_cost || quote.quote?.total_cost || 0;
                                        const qEDD = quote.estimated_delivery_date || quote.quote?.estimated_delivery_date || "";

                                        return (
                                          <Tooltip key={supplierId}>
                                            <TooltipTrigger asChild>
                                              <button
                                                onClick={() => {
                                                  handleOrderQuoteChange(orderIndex, supplierId);
                                                }}
                                                className={`
                                                  relative flex flex-col items-center gap-1.5
                                                  transition-all hover:scale-105
                                                  ${isSelectedInPopover 
                                                    ? "ring-2 ring-primary ring-offset-2 rounded-lg p-1" 
                                                    : ""
                                                  }
                                                `}
                                              >
                                                <Avatar className={`h-12 w-12 ${isSelectedInPopover ? "ring-2 ring-primary" : ""}`}>
                                                  <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-primary/20 to-primary/10">
                                                    {supplierId}
                                                  </AvatarFallback>
                                                </Avatar>
                                                {isPrimary && (
                                                  <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    <span>Recommended</span>
                                                  </div>
                                                )}
                                              </button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <div className="text-xs space-y-1">
                                                <div className="font-semibold">Partner {supplierId}</div>
                                                <div className="text-muted-foreground">
                                                  {formatCurrency(qCost)} • EDD: {qEDD}
                                                </div>
                                              </div>
                                            </TooltipContent>
                                          </Tooltip>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-semibold text-foreground">
                              {formatCurrency(quoteCost)}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            -
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            {quoteEDD}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 border border-primary/10">
                  <Receipt className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base font-semibold">
                    Quote Breakdown
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Shipment {selectedOrder.orderIndex + 1} • Partner {selectedOrder.supplierId}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/30">
                    <span className="text-sm font-medium text-muted-foreground">Freight</span>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(freight)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/30">
                    <span className="text-sm font-medium text-muted-foreground">Fuel surcharge</span>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(fuelSurcharge)}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Total without tax
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(totalWithoutGst)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                    <span className="text-base font-semibold text-foreground">
                      Total Amount
                    </span>
                    <span className="text-xl font-bold text-primary">
                      {formatCurrency(totalCost)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 pt-3 border-t">
                    <span className="text-sm font-medium text-muted-foreground">
                      Volumetric Weight
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {volumetricWeight} kg
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 border border-primary/10">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base font-semibold">
                  Actions
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleCreateShipment}
                className="w-full h-11 font-medium shadow-sm hover:shadow-md transition-shadow"
                size="default"
              >
                <Truck className="mr-2 h-4 w-4" />
                Create Shipment
              </Button>
              <Button
                onClick={handleAddMoneyToWallet}
                variant="outline"
                className="w-full h-11 font-medium"
                size="default"
              >
                <Wallet className="mr-2 h-4 w-4" />
                Add Money to Wallet
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
