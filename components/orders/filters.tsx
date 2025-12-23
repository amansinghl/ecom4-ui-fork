"use client";

import { type DateRange } from "react-day-picker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Search,
  X,
  Tag,
  Calendar as CalendarIcon,
  CreditCard,
  Globe,
  Store,
  Filter,
  FileText,
  XCircle,
  Pause,
  RefreshCw,
  Package,
  Truck,
  CheckCircle,
} from "lucide-react";
import { getOrderStatusDisplayLabel } from "./utils";

interface FiltersProps {
  orderSearch: string;
  setOrderSearch: (value: string) => void;
  statusFilter: string[];
  setStatusFilter: (value: string[]) => void;
  dateRange: DateRange | undefined;
  setDateRange: (value: DateRange | undefined) => void;
  paymentModeFilter: string[];
  setPaymentModeFilter: (value: string[]) => void;
  channelFilter: string[];
  setChannelFilter: (value: string[]) => void;
  storeFilter: string[];
  setStoreFilter: (value: string[]) => void;
  formatDate: (date: Date | undefined) => string;
}

export function Filters({
  orderSearch,
  setOrderSearch,
  statusFilter,
  setStatusFilter,
  dateRange,
  setDateRange,
  paymentModeFilter,
  setPaymentModeFilter,
  channelFilter,
  setChannelFilter,
  storeFilter,
  setStoreFilter,
  formatDate,
}: FiltersProps) {
  const hasActiveFilters =
    orderSearch ||
    statusFilter.length > 0 ||
    dateRange?.from ||
    dateRange?.to ||
    storeFilter.length > 0 ||
    paymentModeFilter.length > 0 ||
    channelFilter.length > 0;

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-[500px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search orders..."
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value)}
            className="pl-9 pr-9 h-9 text-sm"
          />
          {orderSearch && (
            <button
              onClick={() => setOrderSearch("")}
              className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-9 text-sm gap-2 min-w-[160px] justify-start">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {statusFilter.length > 0
                ? `${statusFilter.length} selected`
                : "All Status"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="start">
            <div className="space-y-1">
              {[
                { value: "created", label: "Unfulfilled", icon: FileText },
                { value: "cancelled", label: "Cancelled", icon: XCircle },
                { value: "on hold", label: "On Hold", icon: Pause },
                { value: "cancel requested", label: "Cancel requested", icon: XCircle },
                { value: "processing", label: "Processing", icon: RefreshCw },
                { value: "partially fulfilled", label: "Partially Fulfilled", icon: Package },
                { value: "shipped", label: "Shipped", icon: Truck },
                { value: "fulfilled", label: "Fulfilled", icon: CheckCircle },
              ].map((status) => {
                const Icon = status.icon;
                const isChecked = statusFilter.includes(status.value);
                return (
                  <div
                    key={status.value}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-accent cursor-pointer"
                    onClick={() => {
                      if (isChecked) {
                        setStatusFilter(statusFilter.filter((s) => s !== status.value));
                      } else {
                        setStatusFilter([...statusFilter, status.value]);
                      }
                    }}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setStatusFilter([...statusFilter, status.value]);
                        } else {
                          setStatusFilter(statusFilter.filter((s) => s !== status.value));
                        }
                      }}
                    />
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{status.label}</span>
                  </div>
                );
              })}
              {statusFilter.length > 0 && (
                <div className="pt-2 border-t mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatusFilter([])}
                    className="h-7 w-full text-xs"
                  >
                    Clear All
                  </Button>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-9 text-sm gap-2">
              <CalendarIcon className="h-4 w-4" />
              {dateRange?.from && dateRange?.to
                ? `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`
                : dateRange?.from
                  ? `${formatDate(dateRange.from)} - ...`
                  : "Date Range"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
              className="rounded-lg border shadow-sm"
            />
            {dateRange && (
              <div className="p-3 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDateRange(undefined)}
                  className="h-8 w-full text-sm"
                >
                  Clear
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-9 text-sm gap-2 min-w-[160px] justify-start">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              {paymentModeFilter.length > 0
                ? `${paymentModeFilter.length} selected`
                : "Payment Mode"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="start">
            <div className="space-y-1">
              {[
                { value: "cod", label: "COD" },
                { value: "prepaid", label: "Prepaid" },
              ].map((paymentMode) => {
                const isChecked = paymentModeFilter.includes(paymentMode.value);
                return (
                  <div
                    key={paymentMode.value}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-accent cursor-pointer"
                    onClick={() => {
                      if (isChecked) {
                        setPaymentModeFilter(paymentModeFilter.filter((p) => p !== paymentMode.value));
                      } else {
                        setPaymentModeFilter([...paymentModeFilter, paymentMode.value]);
                      }
                    }}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setPaymentModeFilter([...paymentModeFilter, paymentMode.value]);
                        } else {
                          setPaymentModeFilter(paymentModeFilter.filter((p) => p !== paymentMode.value));
                        }
                      }}
                    />
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{paymentMode.label}</span>
                  </div>
                );
              })}
              {paymentModeFilter.length > 0 && (
                <div className="pt-2 border-t mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPaymentModeFilter([])}
                    className="h-7 w-full text-xs"
                  >
                    Clear All
                  </Button>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-9 text-sm gap-2 min-w-[160px] justify-start">
              <Globe className="h-4 w-4 text-muted-foreground" />
              {channelFilter.length > 0
                ? `${channelFilter.length} selected`
                : "Channel"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="start">
            <div className="space-y-1">
              {[
                { value: "vamaship", label: "Vamaship" },
                { value: "shopify", label: "Shopify" },
                { value: "woocommerce", label: "WooCommerce" },
              ].map((channel) => {
                const isChecked = channelFilter.includes(channel.value);
                return (
                  <div
                    key={channel.value}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-accent cursor-pointer"
                    onClick={() => {
                      if (isChecked) {
                        setChannelFilter(channelFilter.filter((c) => c !== channel.value));
                      } else {
                        setChannelFilter([...channelFilter, channel.value]);
                      }
                    }}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setChannelFilter([...channelFilter, channel.value]);
                        } else {
                          setChannelFilter(channelFilter.filter((c) => c !== channel.value));
                        }
                      }}
                    />
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{channel.label}</span>
                  </div>
                );
              })}
              {channelFilter.length > 0 && (
                <div className="pt-2 border-t mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setChannelFilter([])}
                    className="h-7 w-full text-xs"
                  >
                    Clear All
                  </Button>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-9 text-sm gap-2 min-w-[160px] justify-start">
              <Store className="h-4 w-4 text-muted-foreground" />
              {storeFilter.length > 0
                ? `${storeFilter.length} selected`
                : "All Stores"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="start">
            <div className="space-y-1">
              {[
                { value: "store1", label: "Store 1" },
                { value: "store2", label: "Store 2" },
                { value: "store3", label: "Store 3" },
              ].map((store) => {
                const isChecked = storeFilter.includes(store.value);
                return (
                  <div
                    key={store.value}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-accent cursor-pointer"
                    onClick={() => {
                      if (isChecked) {
                        setStoreFilter(storeFilter.filter((s) => s !== store.value));
                      } else {
                        setStoreFilter([...storeFilter, store.value]);
                      }
                    }}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setStoreFilter([...storeFilter, store.value]);
                        } else {
                          setStoreFilter(storeFilter.filter((s) => s !== store.value));
                        }
                      }}
                    />
                    <Store className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{store.label}</span>
                  </div>
                );
              })}
              {storeFilter.length > 0 && (
                <div className="pt-2 border-t mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStoreFilter([])}
                    className="h-7 w-full text-xs"
                  >
                    Clear All
                  </Button>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            <span>Active filters:</span>
          </div>
          {orderSearch && (
            <Badge variant="secondary" className="h-7 text-sm gap-1.5 px-2.5 font-normal">
              <Search className="h-3 w-3" />
              Orders: {orderSearch}
              <button
                onClick={() => setOrderSearch("")}
                className="ml-0.5 hover:bg-secondary/80 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {statusFilter.length > 0 && statusFilter.map((status) => (
            <Badge key={status} variant="secondary" className="h-7 text-sm gap-1.5 px-2.5 font-normal">
              <Tag className="h-3 w-3" />
              Status: {getOrderStatusDisplayLabel(status)}
              <button
                onClick={() => setStatusFilter(statusFilter.filter((s) => s !== status))}
                className="ml-0.5 hover:bg-secondary/80 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {(dateRange?.from || dateRange?.to) && (
            <Badge variant="secondary" className="h-7 text-sm gap-1.5 px-2.5 font-normal">
              <CalendarIcon className="h-3 w-3" />
              {dateRange.from ? formatDate(dateRange.from) : "..."} - {dateRange.to ? formatDate(dateRange.to) : "..."}
              <button
                onClick={() => setDateRange(undefined)}
                className="ml-0.5 hover:bg-secondary/80 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {storeFilter.length > 0 && storeFilter.map((store) => (
            <Badge key={store} variant="secondary" className="h-7 text-sm gap-1.5 px-2.5 font-normal">
              <Store className="h-3 w-3" />
              Store: {store}
              <button
                onClick={() => setStoreFilter(storeFilter.filter((s) => s !== store))}
                className="ml-0.5 hover:bg-secondary/80 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {paymentModeFilter.length > 0 && paymentModeFilter.map((paymentMode) => (
            <Badge key={paymentMode} variant="secondary" className="h-7 text-sm gap-1.5 px-2.5 font-normal">
              <CreditCard className="h-3 w-3" />
              Payment: {paymentMode}
              <button
                onClick={() => setPaymentModeFilter(paymentModeFilter.filter((p) => p !== paymentMode))}
                className="ml-0.5 hover:bg-secondary/80 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {channelFilter.length > 0 && channelFilter.map((channel) => (
            <Badge key={channel} variant="secondary" className="h-7 text-sm gap-1.5 px-2.5 font-normal">
              <Globe className="h-3 w-3" />
              Channel: {channel}
              <button
                onClick={() => setChannelFilter(channelFilter.filter((c) => c !== channel))}
                className="ml-0.5 hover:bg-secondary/80 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

