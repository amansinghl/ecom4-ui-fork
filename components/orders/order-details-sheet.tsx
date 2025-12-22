"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { ArrowLeft, Package, User, MapPin, Calendar, CreditCard, Phone, Mail, Tag, MessageSquare, Lightbulb, Weight, Ruler, DollarSign, Hash, ShoppingBag, Building2, Edit, Trash2, Save, X, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import { type OrderType } from "@/types/orders";
import { getOrderLineItems, type LineItem, updateOrder } from "@/api/orders";
import { OrderStatusBadge } from "./utils";
import { usePackages } from "@/hooks/use-packages";
import { PackageType } from "@/types/packages";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OrderDetailsSheetProps {
  order: OrderType | null;
  open: boolean;
  onClose: () => void;
  onOrderUpdate?: (updatedOrder: OrderType) => void;
}

export function OrderDetailsSheet({ order, open, onClose, onOrderUpdate }: OrderDetailsSheetProps) {
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [isLoadingLineItems, setIsLoadingLineItems] = useState(false);
  const [lineItemsError, setLineItemsError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Edit state
  const [editedOrder, setEditedOrder] = useState<Partial<OrderType>>({});
  
  // Package autocomplete state
  const { data: packagesData, isLoading: packagesLoading } = usePackages();
  const packages = (packagesData as any)?.packages?.data ?? [];
  const [packageInputValue, setPackageInputValue] = useState("");
  const [showPackageDropdown, setShowPackageDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const packageInputRef = useRef<HTMLInputElement>(null);
  const packageDropdownRef = useRef<HTMLDivElement>(null);
  
  // Dimensions state
  const [length, setLength] = useState<number>(1);
  const [breadth, setBreadth] = useState<number>(1);
  const [height, setHeight] = useState<number>(1);
  const [dimensionsUnit, setDimensionsUnit] = useState<"inch" | "cm">("cm");

  // Parse dimensions string: "10 x 20 x 30 cm" -> { length: 10, breadth: 20, height: 30, unit: "cm" }
  const parseDimensions = (dimensionsStr: string | undefined): { length: number; breadth: number; height: number; unit: "inch" | "cm" } => {
    if (!dimensionsStr) return { length: 1, breadth: 1, height: 1, unit: "cm" };
    
    const parts = dimensionsStr.trim().split(/\s*x\s*/i);
    if (parts.length >= 3) {
      const l = parseFloat(parts[0]);
      const b = parseFloat(parts[1]);
      const h = parseFloat(parts[2]);
      const unitStr = parts[3]?.toLowerCase() || dimensionsStr.toLowerCase();
      const unit: "inch" | "cm" = unitStr.includes("inch") ? "inch" : "cm";
      
      if (!isNaN(l) && !isNaN(b) && !isNaN(h) && l > 0 && b > 0 && h > 0) {
        return { length: l, breadth: b, height: h, unit };
      }
    }
    return { length: 1, breadth: 1, height: 1, unit: "cm" };
  };

  // Initialize edit state when order changes
  useEffect(() => {
    if (order && open) {
      const parsed = parseDimensions(order.dimensions);
      setLength(parsed.length);
      setBreadth(parsed.breadth);
      setHeight(parsed.height);
      setDimensionsUnit(parsed.unit);
      setEditedOrder({
        dest_full_name: order.dest_full_name || "",
        dest_email: order.dest_email || "",
        dest_contact: order.dest_contact || "",
        product_value: order.product_value,
        cod_value: order.cod_value,
        weight_in_kgs: order.weight_in_kgs,
      });
      setPackageInputValue("");
    }
  }, [order, open]);

  useEffect(() => {
    if (!order || !open) {
      setLineItems([]);
      setIsLoadingLineItems(false);
      setLineItemsError(null);
      setIsEditing(false);
      return;
    }

    const fetchData = async () => {
      // Fetch line items
      setIsLoadingLineItems(true);
      setLineItemsError(null);
      try {
        const lineItemsResponse = await getOrderLineItems([order.id]);
        const orderIdStr = order.id.toString();
        setLineItems(lineItemsResponse.line_items?.[orderIdStr] || []);
      } catch (error) {
        console.error("Error fetching line items:", error);
        setLineItemsError(error instanceof Error ? error.message : "Failed to load line items");
      } finally {
        setIsLoadingLineItems(false);
      }
    };

    fetchData();
  }, [order, open]);

  // Package autocomplete
  const filteredPackages = useMemo(() => {
    if (!packageInputValue) return packages;
    return packages.filter((pkg: PackageType) =>
      (pkg.package_identifier || `Package ${pkg.id}`)
        .toLowerCase()
        .includes(packageInputValue.toLowerCase())
    );
  }, [packageInputValue, packages]);

  const handlePackageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPackageInputValue(value);
    setShowPackageDropdown(filteredPackages.length > 0);
    setFocusedIndex(-1);
  };

  const handlePackageSelect = (pkg: PackageType) => {
    const displayName = pkg.package_identifier || `Package ${pkg.id}`;
    setPackageInputValue(displayName);
    
    if (pkg.length) {
      const l = typeof pkg.length === "string" ? parseFloat(pkg.length) : pkg.length;
      if (!isNaN(l) && l > 0) setLength(l);
    }
    if (pkg.breadth) {
      const b = typeof pkg.breadth === "string" ? parseFloat(pkg.breadth) : pkg.breadth;
      if (!isNaN(b) && b > 0) setBreadth(b);
    }
    if (pkg.height) {
      const h = typeof pkg.height === "string" ? parseFloat(pkg.height) : pkg.height;
      if (!isNaN(h) && h > 0) setHeight(h);
    }
    if (pkg.unit && (pkg.unit === "inch" || pkg.unit === "cm")) {
      setDimensionsUnit(pkg.unit as "inch" | "cm");
    }
    
    setShowPackageDropdown(false);
    setFocusedIndex(-1);
    packageInputRef.current?.blur();
  };

  const handlePackageKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showPackageDropdown || filteredPackages.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) =>
        prev < filteredPackages.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && focusedIndex >= 0) {
      e.preventDefault();
      handlePackageSelect(filteredPackages[focusedIndex]);
    } else if (e.key === "Escape") {
      setShowPackageDropdown(false);
      setFocusedIndex(-1);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        packageInputRef.current &&
        !packageInputRef.current.contains(event.target as Node) &&
        packageDropdownRef.current &&
        !packageDropdownRef.current.contains(event.target as Node)
      ) {
        setShowPackageDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Validation
  const validateForm = (): string | null => {
    if (!editedOrder.dest_full_name?.trim()) {
      return "Customer name is required";
    }
    if (!editedOrder.dest_contact?.trim()) {
      return "Customer contact is required";
    }
    const productValue = typeof editedOrder.product_value === "string" 
      ? parseFloat(editedOrder.product_value) 
      : editedOrder.product_value || 0;
    if (isNaN(productValue) || productValue <= 0) {
      return "Product value must be a positive number";
    }
    const codValue = typeof editedOrder.cod_value === "string"
      ? parseFloat(editedOrder.cod_value)
      : editedOrder.cod_value || 0;
    if (codValue > productValue) {
      return "COD value cannot be greater than product value";
    }
    const weight = typeof editedOrder.weight_in_kgs === "string"
      ? parseFloat(editedOrder.weight_in_kgs)
      : editedOrder.weight_in_kgs || 0;
    if (isNaN(weight) || weight <= 0) {
      return "Weight must be a positive number";
    }
    if (length <= 0 || breadth <= 0 || height <= 0) {
      return "All dimensions must be positive numbers";
    }
    return null;
  };

  // Save handler
  const handleSave = async () => {
    if (!order) return;
    
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    setIsSaving(true);
    try {
      const productValue = typeof editedOrder.product_value === "string"
        ? parseFloat(editedOrder.product_value)
        : editedOrder.product_value || 0;
      const codValue = typeof editedOrder.cod_value === "string"
        ? parseFloat(editedOrder.cod_value)
        : editedOrder.cod_value || 0;
      const weight = typeof editedOrder.weight_in_kgs === "string"
        ? parseFloat(editedOrder.weight_in_kgs)
        : editedOrder.weight_in_kgs || 0;

      const updatedOrder = await updateOrder(order.id, {
        dest_full_name: editedOrder.dest_full_name!,
        dest_email: editedOrder.dest_email,
        dest_contact: editedOrder.dest_contact!,
        product_value: productValue,
        cod_value: codValue,
        weight_in_kgs: weight,
        length,
        breadth,
        height,
        dimensions_unit: dimensionsUnit,
      });

      toast.success("Order updated successfully");
      setIsEditing(false);
      
      if (onOrderUpdate) {
        onOrderUpdate(updatedOrder);
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update order");
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel handler
  const handleCancel = () => {
    if (order) {
      const parsed = parseDimensions(order.dimensions);
      setLength(parsed.length);
      setBreadth(parsed.breadth);
      setHeight(parsed.height);
      setDimensionsUnit(parsed.unit);
      setEditedOrder({
        dest_full_name: order.dest_full_name || "",
        dest_email: order.dest_email || "",
        dest_contact: order.dest_contact || "",
        product_value: order.product_value,
        cod_value: order.cod_value,
        weight_in_kgs: order.weight_in_kgs,
      });
      setPackageInputValue("");
    }
    setIsEditing(false);
  };

  if (!order) return null;

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "short" }).toLowerCase();
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  const formatCurrency = (value: string | number | undefined) => {
    if (value === undefined || value === null) return "N/A";
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "N/A";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto [&>button]:hidden pr-6">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-9 w-9"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-primary" />
                <SheetTitle className="text-xl font-semibold">
                  Order #{order.id}
                </SheetTitle>
                <OrderStatusBadge status={order.status} />
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    className="gap-2"
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSave}
                    className="gap-2"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // TODO: Implement delete functionality
                      console.log("Delete order", order.id);
                    }}
                    className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="mt-4 space-y-4">

          {/* Single Card with All Sections */}
          <Card>
            <CardHeader className="pb-0 p-0">
              <div className="rounded-t-lg bg-gradient-to-br from-primary/8 via-primary/12 to-primary/8 p-6">
                <div className="flex items-start gap-5">
                  {/* Product Image/Visual */}
                  <div className="relative h-24 w-24 shrink-0 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/30 shadow-lg overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ShoppingBag className="h-12 w-12 text-primary/60" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-primary/40 to-transparent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Product Name */}
                    {order.product && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <h2 className="text-2xl font-bold text-foreground leading-tight">{order.product}</h2>
                          {/* Order Date with Channel */}
                          {order.order_date && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                {formatDate(order.order_date)}
                                {order.channel_name && (
                                  <span className="ml-2">from {order.channel_name}</span>
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* References - Subtle, below product name */}
                        {(order.reference1 || order.reference2) && (
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                            {order.reference1 && (
                              <div className="flex items-center gap-1.5">
                                <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-xs font-mono text-muted-foreground">Ref: {order.reference1}</span>
                              </div>
                            )}
                            {order.reference2 && (
                              <div className="flex items-center gap-1.5">
                                <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-xs font-mono text-muted-foreground">Ref: {order.reference2}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Payment & Channel - Clean badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          {order.payment_type && (
                            <Badge variant="outline" className="bg-muted/50 border-border text-xs px-2.5 py-0.5 font-medium">
                              <CreditCard className="h-3 w-3 mr-1.5" />
                              {order.payment_type}
                            </Badge>
                          )}
                          {order.channel_name && (
                            <Badge variant="outline" className="bg-muted/50 border-border text-xs px-2.5 py-0.5 font-medium">
                              <Building2 className="h-3 w-3 mr-1.5" />
                              {order.channel_name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>

            {/* Product Value, COD, Weight & Dimensions Section */}
            <div className="px-6 pb-6 border-b">
              {!isEditing ? (
                <div className="grid grid-cols-2 gap-3">
                  {/* Product Value Display */}
                  <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
                    <div className="p-2.5 rounded-lg bg-primary/10">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-0.5">Product Value</p>
                      <p className="text-base font-semibold text-foreground">
                        {order.product_value
                          ? (typeof order.product_value === "string" 
                              ? parseFloat(order.product_value).toLocaleString("en-IN")
                              : order.product_value.toLocaleString("en-IN"))
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  {/* COD Value Display */}
                  <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
                    <div className="p-2.5 rounded-lg bg-primary/10">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-0.5">COD Value</p>
                      <p className="text-base font-semibold text-foreground">
                        {order.cod_value && Number(order.cod_value) > 0 
                          ? formatCurrency(order.cod_value)
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  {/* Weight Display */}
                  <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
                    <div className="p-2.5 rounded-lg bg-primary/10">
                      <Weight className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-0.5">Weight</p>
                      <p className="text-base font-semibold text-foreground">
                        {order.weight_in_kgs ? `${order.weight_in_kgs} kg` : "N/A"}
                      </p>
                    </div>
                  </div>
                  {/* Dimensions Display */}
                  <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
                    <div className="p-2.5 rounded-lg bg-primary/10">
                      <Ruler className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-0.5">Dimensions</p>
                      <p className="text-base font-semibold text-foreground">
                        {order.dimensions || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Product Value Input */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Product Value *</Label>
                      <Input
                        type="number"
                        value={editedOrder.product_value || ""}
                        onChange={(e) => setEditedOrder({
                          ...editedOrder,
                          product_value: e.target.value ? parseFloat(e.target.value) : 0,
                        })}
                        className="w-full"
                        placeholder="Product Value"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    {/* COD Value Input */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">COD Value</Label>
                      <Input
                        type="number"
                        value={editedOrder.cod_value || ""}
                        onChange={(e) => setEditedOrder({
                          ...editedOrder,
                          cod_value: e.target.value ? parseFloat(e.target.value) : 0,
                        })}
                        className="w-full"
                        placeholder="COD Value"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    {/* Weight Input */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Weight (kg) *</Label>
                      <Input
                        type="number"
                        value={editedOrder.weight_in_kgs || ""}
                        onChange={(e) => setEditedOrder({
                          ...editedOrder,
                          weight_in_kgs: e.target.value ? parseFloat(e.target.value) : 0,
                        })}
                        className="w-full"
                        placeholder="Weight"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Package Dimensions */}
                  <div className="space-y-3">
                    <Label className="text-xs font-medium text-muted-foreground">Package Dimensions *</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      {/* Package Autocomplete */}
                      <div className="space-y-1.5 relative">
                        <Label className="text-xs">Package Name</Label>
                        <div className="relative">
                          <Input
                            ref={packageInputRef}
                            placeholder="Type package name"
                            value={packageInputValue}
                            onChange={handlePackageInputChange}
                            onFocus={() => {
                              if (filteredPackages.length > 0) {
                                setShowPackageDropdown(true);
                              }
                            }}
                            onKeyDown={handlePackageKeyDown}
                            className="h-9 text-sm"
                          />
                          {showPackageDropdown && filteredPackages.length > 0 && (
                            <div
                              ref={packageDropdownRef}
                              className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto"
                            >
                              {packagesLoading ? (
                                <div className="flex items-center justify-center p-4">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                              ) : (
                                filteredPackages.map((pkg: PackageType, index: number) => (
                                  <div
                                    key={pkg.id}
                                    className={`px-3 py-2 cursor-pointer text-sm hover:bg-accent ${
                                      index === focusedIndex ? "bg-accent" : ""
                                    }`}
                                    onClick={() => handlePackageSelect(pkg)}
                                    onMouseEnter={() => setFocusedIndex(index)}
                                  >
                                    {pkg.package_identifier || `Package ${pkg.id}`}
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* L × B × H */}
                      <div className="space-y-1.5">
                        <Label className="text-xs">L × B × H</Label>
                        <div className="flex items-center gap-1.5">
                          <Input
                            type="number"
                            value={length || ""}
                            onChange={(e) => setLength(e.target.value ? parseFloat(e.target.value) : 0)}
                            className="w-full h-9 text-sm"
                            placeholder="L"
                            min="0"
                            step="0.1"
                          />
                          <span className="text-xs text-muted-foreground">×</span>
                          <Input
                            type="number"
                            value={breadth || ""}
                            onChange={(e) => setBreadth(e.target.value ? parseFloat(e.target.value) : 0)}
                            className="w-full h-9 text-sm"
                            placeholder="B"
                            min="0"
                            step="0.1"
                          />
                          <span className="text-xs text-muted-foreground">×</span>
                          <Input
                            type="number"
                            value={height || ""}
                            onChange={(e) => setHeight(e.target.value ? parseFloat(e.target.value) : 0)}
                            className="w-full h-9 text-sm"
                            placeholder="H"
                            min="0"
                            step="0.1"
                          />
                        </div>
                      </div>

                      {/* Unit Toggle */}
                      <div className="space-y-1.5">
                        <Label className="text-xs">Unit</Label>
                        <ToggleGroup
                          type="single"
                          value={dimensionsUnit}
                          onValueChange={(value) => {
                            if (value === "inch" || value === "cm") {
                              setDimensionsUnit(value);
                            }
                          }}
                          className="grid grid-cols-2 gap-2"
                        >
                          <ToggleGroupItem
                            value="inch"
                            aria-label="Inch"
                            className="h-9 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                          >
                            Inch
                          </ToggleGroupItem>
                          <ToggleGroupItem
                            value="cm"
                            aria-label="Centimeter"
                            className="h-9 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                          >
                            Cm
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <CardContent className="space-y-6 pt-6">
              {/* Order Information Section */}
              <div className="space-y-5">

                {/* Additional Information */}
                {(order.tags || order.whatsapp_status) && (
                  <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
                    {order.tags && (
                      <div className="flex items-center gap-3">
                        <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Tags</p>
                          <Badge variant="outline" className="text-xs font-medium">
                            {order.tags}
                          </Badge>
                        </div>
                      </div>
                    )}
                    {order.whatsapp_status && (
                      <div className="flex items-center gap-3">
                        <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-muted-foreground mb-1">WhatsApp Status</p>
                          <p className="text-sm font-semibold text-foreground">{order.whatsapp_status}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Order Items Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b">
                  <Package className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">Order Items</h3>
                </div>
                {isLoadingLineItems ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : lineItemsError ? (
                  <div className="text-sm text-destructive py-4">{lineItemsError}</div>
                ) : lineItems.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-4">No line items found</div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold text-xs uppercase tracking-wider">ID</TableHead>
                          <TableHead className="font-semibold text-xs uppercase tracking-wider">Product Name</TableHead>
                          <TableHead className="font-semibold text-xs uppercase tracking-wider text-center">Quantity</TableHead>
                          <TableHead className="font-semibold text-xs uppercase tracking-wider text-right">Product Value</TableHead>
                          <TableHead className="font-semibold text-xs uppercase tracking-wider text-right">Weight (kg)</TableHead>
                          <TableHead className="font-semibold text-xs uppercase tracking-wider">SKU</TableHead>
                          <TableHead className="font-semibold text-xs uppercase tracking-wider">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lineItems.map((item) => (
                          <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-mono text-xs text-muted-foreground py-3">
                              {item.id}
                            </TableCell>
                            <TableCell className="text-sm font-medium py-3">
                              {item.product_name || item.product || item.name || "N/A"}
                            </TableCell>
                            <TableCell className="text-sm text-center py-3">
                              {item.quantity || item.qty || "N/A"}
                            </TableCell>
                            <TableCell className="text-sm font-medium text-right py-3">
                              {item.product_value || item.value ? formatCurrency(item.product_value || item.value) : "N/A"}
                            </TableCell>
                            <TableCell className="text-sm text-right py-3">
                              {item.weight_in_kgs || item.weight || "N/A"}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground py-3">
                              {item.sku || "N/A"}
                            </TableCell>
                            <TableCell className="py-3">
                              {item.status ? (
                                <OrderStatusBadge status={item.status} />
                              ) : (
                                <span className="text-sm text-muted-foreground">N/A</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              {/* Customer Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b">
                  <User className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">Customer Information</h3>
                </div>
                <div className="rounded-xl border bg-gradient-to-br from-muted/30 to-muted/10 p-5 space-y-4">
                  {!isEditing ? (
                    <>
                      {order.dest_full_name && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-0.5">Full Name</p>
                            <p className="text-base font-semibold text-foreground">{order.dest_full_name}</p>
                          </div>
                        </div>
                      )}
                      {(order.dest_contact || order.dest_email) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-11">
                          {order.dest_contact && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                              <p className="text-sm text-foreground font-mono">{order.dest_contact}</p>
                            </div>
                          )}
                          {order.dest_email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                              <p className="text-sm text-foreground break-all">{order.dest_email}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Customer Name Input */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Full Name *</Label>
                        <Input
                          value={editedOrder.dest_full_name || ""}
                          onChange={(e) => setEditedOrder({
                            ...editedOrder,
                            dest_full_name: e.target.value,
                          })}
                          placeholder="Customer full name"
                          className="w-full"
                        />
                      </div>
                      {/* Contact and Email Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-muted-foreground">Contact *</Label>
                          <Input
                            value={editedOrder.dest_contact || ""}
                            onChange={(e) => setEditedOrder({
                              ...editedOrder,
                              dest_contact: e.target.value,
                            })}
                            placeholder="Customer contact"
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-muted-foreground">Email</Label>
                          <Input
                            type="email"
                            value={editedOrder.dest_email || ""}
                            onChange={(e) => setEditedOrder({
                              ...editedOrder,
                              dest_email: e.target.value,
                            })}
                            placeholder="Customer email"
                            className="w-full"
                          />
                        </div>
                      </div>
                    </>
                  )}
                  {/* Address (read-only) */}
                  {(order.city || order.dest_state || order.dest_pincode || order.dest_country) && (
                    <div className="flex items-start gap-3 pl-11">
                      <div className="p-2 rounded-lg bg-primary/10 shrink-0 mt-0.5">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Delivery Address</p>
                        <p className="text-sm font-medium text-foreground leading-relaxed">
                          {[
                            order.city,
                            order.dest_state,
                            order.dest_pincode,
                            order.dest_country,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}

