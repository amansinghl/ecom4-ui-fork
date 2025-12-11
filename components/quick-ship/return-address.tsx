"use client";

import { useEffect, useState, useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { useLocations, usePincodeDetail } from "@/hooks/use-locations";
import { QuickShipFormData } from "@/lib/quick-ship-schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

interface ReturnAddressProps {
  form: UseFormReturn<QuickShipFormData>;
}

export function ReturnAddress({ form }: ReturnAddressProps) {
  const { data: locationsData, isLoading: locationsLoading } = useLocations({
    location_type: "origin",
    per_page: "500",
  });
  
  const locations = locationsData?.locations?.data ?? [];

  const returnLocationType = form.watch("returnAddress.locationType");
  const returnSelectedLocationId = form.watch("returnAddress.locationId");
  const returnPincode = form.watch("returnAddress.pincode");

  const [debouncedReturnPincode, setDebouncedReturnPincode] = useState<string>("");
  
  const { data: returnPincodeData, isLoading: returnPincodeLoading } = usePincodeDetail(
    debouncedReturnPincode && debouncedReturnPincode.length === 6 && returnLocationType === "one-time"
      ? debouncedReturnPincode
      : undefined
  );

  const returnSelectedLocation = locations.find(
    (loc) => String(loc.id) === String(returnSelectedLocationId),
  );

  useEffect(() => {
    if (returnLocationType === "saved" && returnSelectedLocation) {
      form.setValue("returnAddress.full_name", returnSelectedLocation.full_name || "");
      form.setValue("returnAddress.email", returnSelectedLocation.email || "");
      // Remove + from calling_code if present (e.g., "+91" -> "91")
      const callingCode = returnSelectedLocation.calling_code?.replace(/^\+/, "") || "91";
      form.setValue("returnAddress.calling_code", callingCode);
      form.setValue("returnAddress.contact", returnSelectedLocation.contact || "");
      form.setValue("returnAddress.address_line_1", returnSelectedLocation.address_line_1 || "");
      form.setValue("returnAddress.address_line_2", returnSelectedLocation.address_line_2 || "");
      form.setValue("returnAddress.pincode", returnSelectedLocation.pincode || "");
      form.setValue("returnAddress.city", returnSelectedLocation.city || "");
      form.setValue("returnAddress.state", returnSelectedLocation.state || "");
      form.setValue("returnAddress.country", returnSelectedLocation.country || "India");
    }
  }, [returnSelectedLocation, returnLocationType, form]);

  useEffect(() => {
    if (returnPincode && returnPincode.length === 6 && returnLocationType === "one-time") {
      const timeoutId = setTimeout(() => {
        setDebouncedReturnPincode(returnPincode);
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setDebouncedReturnPincode("");
    }
  }, [returnPincode, returnLocationType]);

  useEffect(() => {
    if (returnPincodeData && returnLocationType === "one-time") {
      form.setValue("returnAddress.city", returnPincodeData.city);
      form.setValue("returnAddress.state", returnPincodeData.state);
      form.setValue("returnAddress.country", returnPincodeData.country);
    }
  }, [returnPincodeData, returnLocationType, form]);

  const isReturnSavedLocation = returnLocationType === "saved";
  const isReturnDisabled = isReturnSavedLocation && !!returnSelectedLocation;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="return-address-location-type" className="text-xs font-medium text-muted-foreground">
            {isReturnSavedLocation ? "Saved Location" : "One-Time Address"}
          </Label>
        </div>
        <Switch
          id="return-address-location-type"
          checked={isReturnSavedLocation}
          onCheckedChange={(checked) =>
            form.setValue(
              "returnAddress.locationType",
              checked ? "saved" : "one-time",
            )
          }
        />
      </div>

      {isReturnSavedLocation && (
        <div className="space-y-1.5">
          <Label htmlFor="return-address-location" className="text-xs">
            Select Location <span className="text-destructive">*</span>
          </Label>
          <Select
            value={returnSelectedLocationId || ""}
            onValueChange={(value) => {
              form.setValue("returnAddress.locationId", value);
            }}
          >
            <SelectTrigger id="return-address-location" className="w-full">
              <SelectValue placeholder="Select a saved location" />
            </SelectTrigger>
            <SelectContent>
              {locationsLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : locations.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">
                  No saved locations found
                </div>
              ) : (
                locations.map((location: any) => {
                  const locationDetails = [
                    location.full_name && `Name: ${location.full_name}`,
                    location.contact && `Contact: ${location.contact}`,
                    location.email && `Email: ${location.email}`,
                    location.address_line_1 && `Address: ${location.address_line_1}`,
                    location.city && location.state && `${location.city}, ${location.state}`,
                    location.pincode && `Pincode: ${location.pincode}`,
                  ].filter(Boolean);

                  return (
                    <Tooltip key={location.id}>
                      <TooltipTrigger asChild>
                        <SelectItem 
                          value={String(location.id)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-2 w-full min-w-0">
                            {location.channel_name && (
                              <Badge 
                                variant="secondary" 
                                className="text-[10px] px-1.5 py-0 h-4 shrink-0 font-medium"
                              >
                                {location.channel_name}
                              </Badge>
                            )}
                            <span className="flex-1 min-w-0 truncate font-medium">
                              {location.location_name}
                            </span>
                            {location.city && (
                              <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {location.city}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      </TooltipTrigger>
                      {locationDetails.length > 0 && (
                        <TooltipContent side="right" className="max-w-xs">
                          <div className="space-y-1 text-xs">
                            <div className="font-semibold mb-1.5">{location.location_name}</div>
                            {locationDetails.map((detail, idx) => (
                              <div key={idx} className="text-muted-foreground">{detail}</div>
                            ))}
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-1 gap-2.5">
        <div className="space-y-1.5">
          <Label htmlFor="return-address-name" className="text-xs">
            Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="return-address-name"
            {...form.register("returnAddress.full_name" as const)}
            disabled={isReturnDisabled}
            aria-invalid={
              form.formState.errors.returnAddress?.full_name ? "true" : "false"
            }
          />
          {form.formState.errors.returnAddress?.full_name && (
            <p className="text-sm text-destructive">
              {form.formState.errors.returnAddress?.full_name?.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="return-address-email" className="text-xs">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="return-address-email"
            type="email"
            {...form.register("returnAddress.email" as const)}
            disabled={isReturnSavedLocation}
            aria-invalid={
              form.formState.errors.returnAddress?.email ? "true" : "false"
            }
          />
          {form.formState.errors.returnAddress?.email && (
            <p className="text-sm text-destructive">
              {form.formState.errors.returnAddress?.email?.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="return-address-calling-code" className="text-xs">
              ISD Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="return-address-calling-code"
              {...form.register("returnAddress.calling_code" as const)}
              placeholder="91"
              disabled={isReturnSavedLocation}
              aria-invalid={
                form.formState.errors.returnAddress?.calling_code
                  ? "true"
                  : "false"
              }
            />
            {form.formState.errors.returnAddress?.calling_code && (
              <p className="text-xs text-destructive">
                {form.formState.errors.returnAddress?.calling_code?.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="return-address-contact" className="text-xs">
              Phone <span className="text-destructive">*</span>
            </Label>
            <Input
              id="return-address-contact"
              type="tel"
              maxLength={10}
              {...form.register("returnAddress.contact" as const)}
              disabled={isReturnDisabled}
              aria-invalid={
                form.formState.errors.returnAddress?.contact ? "true" : "false"
              }
            />
            {form.formState.errors.returnAddress?.contact && (
              <p className="text-xs text-destructive">
                {form.formState.errors.returnAddress?.contact?.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="return-address-address" className="text-xs">
            Address <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="return-address-address"
            {...form.register("returnAddress.address_line_1" as const)}
            disabled={isReturnDisabled}
            maxLength={200}
            rows={2}
            className="text-sm"
            aria-invalid={
              form.formState.errors.returnAddress?.address_line_1
                ? "true"
                : "false"
            }
          />
          {form.formState.errors.returnAddress?.address_line_1 && (
            <p className="text-xs text-destructive">
              {form.formState.errors.returnAddress?.address_line_1?.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="return-address-pincode" className="text-xs">
              Pincode <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="return-address-pincode"
                type="text"
                maxLength={6}
                {...form.register("returnAddress.pincode" as const)}
                disabled={isReturnDisabled}
                aria-invalid={
                  form.formState.errors.returnAddress?.pincode ? "true" : "false"
                }
              />
              {returnPincodeLoading && (
                <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            {form.formState.errors.returnAddress?.pincode && (
              <p className="text-xs text-destructive">
                {form.formState.errors.returnAddress?.pincode?.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="return-address-city" className="text-xs">
              City <span className="text-destructive">*</span>
            </Label>
            <Input
              id="return-address-city"
              {...form.register("returnAddress.city" as const)}
              disabled={isReturnDisabled}
              aria-invalid={
                form.formState.errors.returnAddress?.city ? "true" : "false"
              }
            />
            {form.formState.errors.returnAddress?.city && (
              <p className="text-xs text-destructive">
                {form.formState.errors.returnAddress?.city?.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="return-address-state" className="text-xs">
              State <span className="text-destructive">*</span>
            </Label>
            <Input
              id="return-address-state"
              {...form.register("returnAddress.state" as const)}
              disabled={isReturnDisabled}
              className="text-sm"
              aria-invalid={
                form.formState.errors.returnAddress?.state ? "true" : "false"
              }
            />
            {form.formState.errors.returnAddress?.state && (
              <p className="text-xs text-destructive">
                {form.formState.errors.returnAddress?.state?.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="return-address-country" className="text-xs">
            Country <span className="text-destructive">*</span>
          </Label>
          <Input
            id="return-address-country"
            {...form.register("returnAddress.country" as const)}
            disabled={isReturnDisabled}
            defaultValue="India"
            aria-invalid={
              form.formState.errors.returnAddress?.country ? "true" : "false"
            }
          />
          {form.formState.errors.returnAddress?.country && (
            <p className="text-xs text-destructive">
              {form.formState.errors.returnAddress?.country?.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

