"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plane, Truck, Users, Building2, HelpCircle, Eye, Ship, Package, BarChart3 } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { AreaChart, Area, XAxis } from "recharts";
import type { LocationType } from "@/types/locations";
import { useOrderConversionMetrics, useOrderActivityMetrics, useOrderStatsSummary } from "@/hooks/use-order-metrics";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsAndOptionsProps {
  mounted: boolean;
  transportMode: "express" | "surface" | "";
  setTransportMode: (value: "express" | "surface" | "") => void;
  businessType: "b2c" | "b2b" | "";
  setBusinessType: (value: "b2c" | "b2b" | "") => void;
  selectedGstBranch: string;
  setSelectedGstBranch: (value: string) => void;
  selectedOriginAddress: string;
  setSelectedOriginAddress: (value: string) => void;
  branches: Array<{ id: number; branch: string; gst_number: string }>;
  branchesLoading: boolean;
  locations: LocationType[];
  locationsLoading: boolean;
  isLoadingQuote: boolean;
  onViewQuote: () => void;
  onQuickShip: () => void;
  formatBranchName: (branch: { branch: string; gst_number: string }) => string;
  formatFullAddress: (location: LocationType) => string;
}

const ordersChartConfig: ChartConfig = {
  newOrders: {
    label: "New Orders",
    color: "var(--chart-1)",
  },
  converted: {
    label: "Shipment Converted",
    color: "var(--chart-2)",
  },
};

const activityChartConfig: ChartConfig = {
  orders: {
    label: "New Orders Activity",
    color: "var(--chart-1)",
  },
};

export function StatsAndOptions({
  mounted,
  transportMode,
  setTransportMode,
  businessType,
  setBusinessType,
  selectedGstBranch,
  setSelectedGstBranch,
  selectedOriginAddress,
  setSelectedOriginAddress,
  branches,
  branchesLoading,
  locations,
  locationsLoading,
  isLoadingQuote,
  onViewQuote,
  onQuickShip,
  formatBranchName,
  formatFullAddress,
}: StatsAndOptionsProps) {
  const { data: conversionData, isLoading: conversionLoading } = useOrderConversionMetrics();
  const { data: activityData, isLoading: activityLoading } = useOrderActivityMetrics();
  const { data: summaryData, isLoading: summaryLoading } = useOrderStatsSummary();

  const ordersChartData = conversionData?.metrics ?? [];
  const dailyActivityData = activityData?.metrics ?? [];
  const newOrdersCount = summaryData?.total_orders ?? 0;
  const convertedCount = summaryData?.converted_orders ?? 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      {/* Left: Stat Cards - 60% */}
      <div className="grid grid-cols-2 gap-4 lg:col-span-3">
        {/* Card 1: New Orders & Shipment Converted with Chart */}
        <Card className="pb-0 bg-gradient-to-br from-background to-muted/20">
          <CardContent className="px-4">
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Package className="h-4 w-4 text-foreground" />
                  <p className="text-sm font-medium text-foreground">New Orders</p>
                </div>
                <p className="text-xl font-bold">
                  {summaryLoading ? "..." : newOrdersCount.toLocaleString()}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Ship className="h-4 w-4 text-foreground" />
                  <p className="text-sm font-medium text-foreground">Shipment Converted</p>
                </div>
                <p className="text-xl font-bold">
                  {summaryLoading ? "..." : convertedCount.toLocaleString()}
                </p>
              </div>
            </div>
            {mounted ? (
              conversionLoading ? (
                <Skeleton className="h-[180px] w-full" />
              ) : ordersChartData.length > 0 ? (
                <ChartContainer config={ordersChartConfig} className="h-[180px] w-full">
                  <AreaChart accessibilityLayer data={ordersChartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12, fill: "var(--foreground)", fontWeight: 500 }}
                      axisLine={{ stroke: "var(--border)" }}
                      tickLine={{ stroke: "var(--border)" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="new_orders"
                      stackId="1"
                      stroke="var(--chart-1)"
                      fill="var(--chart-1)"
                      fillOpacity={0.6}
                      strokeWidth={1.5}
                    />
                    <Area
                      type="monotone"
                      dataKey="converted"
                      stackId="1"
                      stroke="var(--chart-2)"
                      fill="var(--chart-2)"
                      fillOpacity={0.6}
                      strokeWidth={1.5}
                    />
                  </AreaChart>
                </ChartContainer>
              ) : (
                <div className="h-[180px] w-full flex items-center justify-center text-muted-foreground text-sm">
                  No data available
                </div>
              )
            ) : (
              <div className="h-[180px] w-full" />
            )}
          </CardContent>
        </Card>

        <Card className="pb-0 bg-gradient-to-br from-background to-muted/20">
          <CardContent className="px-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Activity - Last 7 Days</p>
                <p className="text-xl font-bold">New Orders Activity</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
            {mounted ? (
              activityLoading ? (
                <Skeleton className="h-[180px] w-full" />
              ) : dailyActivityData.length > 0 ? (
                <ChartContainer config={activityChartConfig} className="h-[180px] w-full">
                  <AreaChart data={dailyActivityData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <XAxis 
                      dataKey="day" 
                      tick={{ fontSize: 12, fill: "var(--foreground)", fontWeight: 500 }}
                      axisLine={{ stroke: "var(--border)" }}
                      tickLine={{ stroke: "var(--border)" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="orders"
                      stroke="var(--chart-1)"
                      fill="var(--chart-1)"
                      fillOpacity={0.6}
                      strokeWidth={1.5}
                    />
                  </AreaChart>
                </ChartContainer>
              ) : (
                <div className="h-[180px] w-full flex items-center justify-center text-muted-foreground text-sm">
                  No data available
                </div>
              )
            ) : (
              <div className="h-[180px] w-full" />
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="lg:col-span-2">
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Transport Mode</Label>
                <ToggleGroup
                  type="single"
                  value={transportMode}
                  onValueChange={(value) => {
                    if (value) {
                      setTransportMode(value as "express" | "surface");
                      if (value === "express") {
                        setBusinessType("");
                      } else if (value === "surface") {
                        setBusinessType("b2c");
                      }
                    } else {
                      setTransportMode("");
                      setBusinessType("");
                    }
                  }}
                  className="grid grid-cols-2 gap-2"
                >
                  <ToggleGroupItem
                    value="express"
                    aria-label="Express"
                    className="h-10 text-sm data-[state=on]:bg-primary data-[state=on]:text-primary-foreground flex items-center justify-center gap-2 font-medium border shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Plane className="h-4 w-4" />
                    Express
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="surface"
                    aria-label="Surface"
                    className="h-10 text-sm data-[state=on]:bg-primary data-[state=on]:text-primary-foreground flex items-center justify-center gap-2 font-medium border shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Truck className="h-4 w-4" />
                    Surface
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      <Label className="text-xs font-semibold">Type of Weight</Label>
                      {transportMode !== "surface" && (
                        <HelpCircle className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    <ToggleGroup
                      type="single"
                      value={businessType}
                      onValueChange={(value) => {
                        if (value) {
                          setBusinessType(value as "b2c" | "b2b");
                        } else {
                          setBusinessType("");
                        }
                      }}
                      disabled={transportMode !== "surface"}
                      className="grid grid-cols-2 gap-2"
                    >
                      <ToggleGroupItem
                        value="b2c"
                        aria-label="B2C"
                        disabled={transportMode !== "surface"}
                        className="h-10 text-sm data-[state=on]:bg-primary data-[state=on]:text-primary-foreground flex items-center justify-center gap-2 font-medium border shadow-sm hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Users className="h-4 w-4" />
                        B2C
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="b2b"
                        aria-label="B2B"
                        disabled={transportMode !== "surface"}
                        className="h-10 text-sm data-[state=on]:bg-primary data-[state=on]:text-primary-foreground flex items-center justify-center gap-2 font-medium border shadow-sm hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Building2 className="h-4 w-4" />
                        B2B
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </TooltipTrigger>
                {transportMode !== "surface" && (
                  <TooltipContent>
                    <p>Type of Weight is only available when Surface transport mode is selected</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="gst-branch" className="text-xs font-semibold">
                    GST Branch
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Select the GST branch for order to shipment conversion</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select
                  value={selectedGstBranch}
                  onValueChange={setSelectedGstBranch}
                  disabled={branchesLoading}
                >
                  <SelectTrigger id="gst-branch" className="w-full">
                    <SelectValue placeholder="Select GST Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branchesLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <span className="text-sm text-muted-foreground">Loading...</span>
                      </div>
                    ) : branches.length === 0 ? (
                      <div className="p-4 text-sm text-muted-foreground">
                        No branches available
                      </div>
                    ) : (
                      branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id.toString()}>
                          {formatBranchName(branch)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="origin-address" className="text-xs font-semibold">
                    Origin Address
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Select the origin address for order to shipment conversion</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedOriginAddress}
                    onValueChange={setSelectedOriginAddress}
                    disabled={locationsLoading}
                  >
                    <SelectTrigger id="origin-address" className="w-full">
                      <SelectValue placeholder="Select Origin Address" />
                    </SelectTrigger>
                    <SelectContent>
                      {locationsLoading ? (
                        <div className="flex items-center justify-center p-4">
                          <span className="text-sm text-muted-foreground">Loading...</span>
                        </div>
                      ) : locations.length === 0 ? (
                        <div className="p-4 text-sm text-muted-foreground">
                          No locations available
                        </div>
                      ) : (
                        locations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.location_name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {selectedOriginAddress && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        {(() => {
                          const selectedLocation = locations.find(
                            (loc) => loc.id === selectedOriginAddress
                          );
                          return selectedLocation ? (
                            <>
                              <p className="font-semibold mb-1">
                                {selectedLocation.location_name}
                              </p>
                              <p className="text-xs">{formatFullAddress(selectedLocation)}</p>
                            </>
                          ) : null;
                        })()}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-end gap-3 border-t">
          <Button
            variant="outline"
            disabled={isLoadingQuote}
            onClick={onViewQuote}
          >
            <Eye className="h-4 w-4" />
            {isLoadingQuote ? "Loading..." : "View Quote"}
          </Button>
          <Button onClick={onQuickShip}>
            <Ship className="h-4 w-4" />
            Quick Ship
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

