"use client";

import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { QuickShipFormData } from "@/lib/quick-ship-schema";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  HelpCircle, 
  ArrowRight, 
  RotateCcw, 
  Plane, 
  Truck, 
  Users, 
  Building2, 
  CreditCard, 
  Banknote 
} from "lucide-react";

interface ShipmentOptionsProps {
  form: UseFormReturn<QuickShipFormData>;
}

export function ShipmentOptions({ form }: ShipmentOptionsProps) {
  const shipmentType = form.watch("shipmentType");
  const transportMode = form.watch("transportMode");
  const businessType = form.watch("businessType");
  const paymentType = form.watch("paymentType");

  // Payment type is visible only for light_weight, domestic, forward shipments
  const showPaymentType = shipmentType === "forward";

  useEffect(() => {
    if (shipmentType === "forward" && transportMode === "surface" && !businessType) {
      form.setValue("businessType", "b2c");
    }
  }, [shipmentType, transportMode, businessType, form]);

  return (
    <div className="space-y-5">
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5">
          <Label className="text-xs font-semibold text-foreground">Type</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Forward: Shipment from origin to destination. Reverse: Return shipment from destination to origin.</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <ToggleGroup
          type="single"
          value={shipmentType}
          onValueChange={(value) => {
            if (value) {
              form.setValue("shipmentType", value as "forward" | "reverse");
              if (value === "reverse") {
                form.setValue("paymentType", undefined);
                form.setValue("product.cod_value", undefined);
              }
            }
          }}
          className="grid grid-cols-2 gap-2.5"
        >
          <ToggleGroupItem
            value="forward"
            aria-label="Forward"
            className="h-11 text-sm data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md flex items-center justify-center gap-2 font-medium border shadow-sm hover:shadow-md transition-shadow"
          >
            <ArrowRight className="h-4 w-4" />
            Forward
          </ToggleGroupItem>
          <ToggleGroupItem
            value="reverse"
            aria-label="Reverse"
            className="h-11 text-sm data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md flex items-center justify-center gap-2 font-medium border shadow-sm hover:shadow-md transition-shadow"
          >
            <RotateCcw className="h-4 w-4" />
            Reverse
          </ToggleGroupItem>
        </ToggleGroup>
        {form.formState.errors.shipmentType && (
          <p className="text-xs text-destructive">
            {form.formState.errors.shipmentType.message}
          </p>
        )}
      </div>

      {shipmentType === "forward" && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5">
            <Label className="text-xs font-semibold text-foreground">Transport Mode</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Express: Faster delivery via air transport. Surface: Standard delivery via road/rail transport.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <ToggleGroup
            type="single"
            value={transportMode}
            onValueChange={(value) => {
              if (value) {
                form.setValue("transportMode", value as "express" | "surface");
                // Clear business type if switching to express
                if (value === "express") {
                  form.setValue("businessType", undefined);
                } else if (value === "surface") {
                  // Set B2C as default when surface is selected
                  form.setValue("businessType", "b2c");
                }
              }
            }}
            className="grid grid-cols-2 gap-2.5"
          >
            <ToggleGroupItem
              value="express"
              aria-label="Express (Air)"
              className="h-11 text-sm data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md flex items-center justify-center gap-2 font-medium border shadow-sm hover:shadow-md transition-shadow"
            >
              <Plane className="h-4 w-4" />
              Express
            </ToggleGroupItem>
            <ToggleGroupItem
              value="surface"
              aria-label="Surface"
              className="h-11 text-sm data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md flex items-center justify-center gap-2 font-medium border shadow-sm hover:shadow-md transition-shadow"
            >
              <Truck className="h-4 w-4" />
              Surface
            </ToggleGroupItem>
          </ToggleGroup>
          {form.formState.errors.transportMode && (
            <p className="text-xs text-destructive">
              {form.formState.errors.transportMode.message}
            </p>
          )}
        </div>
      )}

      {shipmentType === "forward" && transportMode === "surface" && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5">
            <Label className="text-xs font-semibold text-foreground">Business Type</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>B2C: Business to Consumer. B2B: Business to Business.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <ToggleGroup
            type="single"
            value={businessType || ""}
            onValueChange={(value) => {
              if (value) {
                form.setValue("businessType", value as "b2c" | "b2b");
              }
            }}
            className="grid grid-cols-2 gap-2.5"
          >
            <ToggleGroupItem
              value="b2c"
              aria-label="B2C"
              className="h-11 text-sm data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md flex items-center justify-center gap-2 font-medium border shadow-sm hover:shadow-md transition-shadow"
            >
              <Users className="h-4 w-4" />
              B2C
            </ToggleGroupItem>
            <ToggleGroupItem
              value="b2b"
              aria-label="B2B"
              className="h-11 text-sm data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md flex items-center justify-center gap-2 font-medium border shadow-sm hover:shadow-md transition-shadow"
            >
              <Building2 className="h-4 w-4" />
              B2B
            </ToggleGroupItem>
          </ToggleGroup>
          {form.formState.errors.businessType && (
            <p className="text-xs text-destructive">
              {form.formState.errors.businessType.message}
            </p>
          )}
        </div>
      )}

      {showPaymentType && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5">
            <Label className="text-xs font-semibold text-foreground">Payment Type</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Prepaid: Payment received upfront. COD: Cash on Delivery - payment collected at delivery.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <ToggleGroup
            type="single"
            value={paymentType || ""}
            onValueChange={(value) => {
              if (value) {
                form.setValue("paymentType", value as "prepaid" | "cod");
                if (value === "prepaid") {
                  form.setValue("product.cod_value", undefined);
                }
              }
            }}
            className="grid grid-cols-2 gap-2.5"
          >
            <ToggleGroupItem
              value="prepaid"
              aria-label="Prepaid"
              className="h-11 text-sm data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md flex items-center justify-center gap-2 font-medium border shadow-sm hover:shadow-md transition-shadow"
            >
              <CreditCard className="h-4 w-4" />
              Prepaid
            </ToggleGroupItem>
            <ToggleGroupItem
              value="cod"
              aria-label="COD"
              className="h-11 text-sm data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md flex items-center justify-center gap-2 font-medium border shadow-sm hover:shadow-md transition-shadow"
            >
              <Banknote className="h-4 w-4" />
              COD
            </ToggleGroupItem>
          </ToggleGroup>
          {form.formState.errors.paymentType && (
            <p className="text-xs text-destructive">
              {form.formState.errors.paymentType.message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

