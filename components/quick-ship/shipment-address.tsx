"use client";

import { useEffect, useState, useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { LocationType } from "@/types/locations";
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
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2, MapPin } from "lucide-react";

interface ShipmentAddressProps {
  form: UseFormReturn<QuickShipFormData>;
  addressPrefix: "originAddress" | "destinationAddress";
  title: string;
  locations?: LocationType[];
}

export function ShipmentAddress({
  form,
  addressPrefix,
  title,
}: ShipmentAddressProps) {
  const locationTypeParam = addressPrefix === "originAddress" 
    ? "origin" 
    : addressPrefix === "destinationAddress"
    ? "destination"
    : undefined;
  
  const { data: locationsData, isLoading: locationsLoading } = useLocations(
    locationTypeParam ? { location_type: locationTypeParam, per_page: "500" } : undefined
  );
  
  const locations = locationsData?.locations?.data ?? [];

  const locationType = form.watch(`${addressPrefix}.locationType`);
  const selectedLocationId = form.watch(`${addressPrefix}.locationId`);
  const pincode = form.watch(`${addressPrefix}.pincode`);
  const useDifferentReturnAddress = form.watch("useDifferentReturnAddress");

  const [debouncedPincode, setDebouncedPincode] = useState<string>("");
  
  const { data: pincodeData, isLoading: pincodeLoading } = usePincodeDetail(
    debouncedPincode && debouncedPincode.length === 6 && locationType === "one-time"
      ? debouncedPincode
      : undefined
  );

  const selectedLocation = locations.find(
    (loc) => String(loc.id) === String(selectedLocationId),
  );

  useEffect(() => {
    if (locationType === "saved" && selectedLocation) {
      form.setValue(`${addressPrefix}.full_name`, selectedLocation.full_name || "");
      form.setValue(`${addressPrefix}.email`, selectedLocation.email || "");
      // Remove + from calling_code if present (e.g., "+91" -> "91")
      const callingCode = selectedLocation.calling_code?.replace(/^\+/, "") || "91";
      form.setValue(`${addressPrefix}.calling_code`, callingCode);
      form.setValue(`${addressPrefix}.contact`, selectedLocation.contact || "");
      form.setValue(`${addressPrefix}.address_line_1`, selectedLocation.address_line_1 || "");
      form.setValue(`${addressPrefix}.address_line_2`, selectedLocation.address_line_2 || "");
      form.setValue(`${addressPrefix}.pincode`, selectedLocation.pincode || "");
      form.setValue(`${addressPrefix}.city`, selectedLocation.city || "");
      form.setValue(`${addressPrefix}.state`, selectedLocation.state || "");
      form.setValue(`${addressPrefix}.country`, selectedLocation.country || "India");
    }
  }, [selectedLocation, locationType, form, addressPrefix]);

  useEffect(() => {
    if (pincode && pincode.length === 6 && locationType === "one-time") {
      const timeoutId = setTimeout(() => {
        setDebouncedPincode(pincode);
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setDebouncedPincode("");
    }
  }, [pincode, locationType]);

  useEffect(() => {
    if (pincodeData && locationType === "one-time") {
      form.setValue(`${addressPrefix}.city`, pincodeData.city);
      form.setValue(`${addressPrefix}.state`, pincodeData.state);
      form.setValue(`${addressPrefix}.country`, pincodeData.country);
    }
  }, [pincodeData, locationType, form, addressPrefix]);

  const isSavedLocation = locationType === "saved";
  const isDisabled = isSavedLocation && !!selectedLocation;
  const isOriginAddress = addressPrefix === "originAddress";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2 gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Label htmlFor={`${addressPrefix}-location-type`} className="text-xs font-medium text-muted-foreground">
            {isSavedLocation ? "Saved Location" : "One-Time Address"}
          </Label>
        </div>
        <Switch
          id={`${addressPrefix}-location-type`}
          checked={isSavedLocation}
          onCheckedChange={(checked) =>
            form.setValue(
              `${addressPrefix}.locationType`,
              checked ? "saved" : "one-time",
            )
          }
        />
        {isOriginAddress && (
          <>
            <div className="flex items-center gap-2 flex-1 justify-end">
              <Label htmlFor="use-different-return-address" className="text-xs font-medium text-muted-foreground">
                Use Different Return Address
              </Label>
            </div>
            <Switch
              id="use-different-return-address"
              checked={useDifferentReturnAddress}
              onCheckedChange={(checked) => {
                form.setValue("useDifferentReturnAddress", checked);
                if (!checked) {
                  form.setValue("returnAddress", undefined);
                } else {
                  if (!form.getValues("returnAddress")) {
                    form.setValue("returnAddress", {
                      locationType: "one-time",
                      full_name: "",
                      email: "",
                      calling_code: "91",
                      contact: "",
                      address_line_1: "",
                      address_line_2: "",
                      pincode: "",
                      city: "",
                      state: "",
                      country: "India",
                    });
                  }
                }
              }}
            />
          </>
        )}
      </div>

      {isSavedLocation && (
        <div className="space-y-1.5">
          <Label htmlFor={`${addressPrefix}-location`} className="text-xs">
            Select Location <span className="text-destructive">*</span>
          </Label>
          <Select
            value={selectedLocationId || ""}
            onValueChange={(value) => {
              form.setValue(`${addressPrefix}.locationId`, value);
            }}
          >
            <SelectTrigger id={`${addressPrefix}-location`} className="w-full">
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
                locations.map((location: LocationType) => {
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
          <Label htmlFor={`${addressPrefix}-name`} className="text-xs">
            Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`${addressPrefix}-name`}
            {...form.register(`${addressPrefix}.full_name` as const)}
            disabled={isDisabled}
            aria-invalid={
              form.formState.errors[addressPrefix]?.full_name ? "true" : "false"
            }
          />
          {form.formState.errors[addressPrefix]?.full_name && (
            <p className="text-sm text-destructive">
              {form.formState.errors[addressPrefix]?.full_name?.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${addressPrefix}-email`} className="text-xs">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`${addressPrefix}-email`}
            type="email"
            {...form.register(`${addressPrefix}.email` as const)}
            disabled={isSavedLocation}
            aria-invalid={
              form.formState.errors[addressPrefix]?.email ? "true" : "false"
            }
          />
          {form.formState.errors[addressPrefix]?.email && (
            <p className="text-sm text-destructive">
              {form.formState.errors[addressPrefix]?.email?.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label htmlFor={`${addressPrefix}-calling-code`} className="text-xs">
              ISD Code <span className="text-destructive">*</span>
            </Label>
          <Input
            id={`${addressPrefix}-calling-code`}
            {...form.register(`${addressPrefix}.calling_code` as const)}
            placeholder="91"
            disabled={isSavedLocation}
            aria-invalid={
              form.formState.errors[addressPrefix]?.calling_code
                ? "true"
                : "false"
            }
          />
            {form.formState.errors[addressPrefix]?.calling_code && (
              <p className="text-xs text-destructive">
                {form.formState.errors[addressPrefix]?.calling_code?.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${addressPrefix}-contact`} className="text-xs">
              Phone <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`${addressPrefix}-contact`}
              type="tel"
              maxLength={10}
              {...form.register(`${addressPrefix}.contact` as const)}
              disabled={isDisabled}
              aria-invalid={
                form.formState.errors[addressPrefix]?.contact ? "true" : "false"
              }
            />
            {form.formState.errors[addressPrefix]?.contact && (
              <p className="text-xs text-destructive">
                {form.formState.errors[addressPrefix]?.contact?.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${addressPrefix}-address`} className="text-xs">
            Address <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id={`${addressPrefix}-address`}
            {...form.register(`${addressPrefix}.address_line_1` as const)}
            disabled={isDisabled}
            maxLength={200}
            rows={2}
            className="text-sm"
            aria-invalid={
              form.formState.errors[addressPrefix]?.address_line_1
                ? "true"
                : "false"
            }
          />
          {form.formState.errors[addressPrefix]?.address_line_1 && (
            <p className="text-xs text-destructive">
              {form.formState.errors[addressPrefix]?.address_line_1?.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1.5">
            <Label htmlFor={`${addressPrefix}-pincode`} className="text-xs">
              Pincode <span className="text-destructive">*</span>
            </Label>
          <div className="relative">
            <Input
              id={`${addressPrefix}-pincode`}
              type="text"
              maxLength={6}
              {...form.register(`${addressPrefix}.pincode` as const)}
              disabled={isDisabled}
              aria-invalid={
                form.formState.errors[addressPrefix]?.pincode ? "true" : "false"
              }
            />
            {pincodeLoading && (
              <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
            {form.formState.errors[addressPrefix]?.pincode && (
              <p className="text-xs text-destructive">
                {form.formState.errors[addressPrefix]?.pincode?.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${addressPrefix}-city`} className="text-xs">
              City <span className="text-destructive">*</span>
            </Label>
          <Input
            id={`${addressPrefix}-city`}
            {...form.register(`${addressPrefix}.city` as const)}
            disabled={isDisabled}
            aria-invalid={
              form.formState.errors[addressPrefix]?.city ? "true" : "false"
            }
          />
            {form.formState.errors[addressPrefix]?.city && (
              <p className="text-xs text-destructive">
                {form.formState.errors[addressPrefix]?.city?.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${addressPrefix}-state`} className="text-xs">
              State <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`${addressPrefix}-state`}
              {...form.register(`${addressPrefix}.state` as const)}
              disabled={isDisabled}
              className="text-sm"
              aria-invalid={
                form.formState.errors[addressPrefix]?.state ? "true" : "false"
              }
            />
            {form.formState.errors[addressPrefix]?.state && (
              <p className="text-xs text-destructive">
                {form.formState.errors[addressPrefix]?.state?.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${addressPrefix}-country`} className="text-xs">
            Country <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`${addressPrefix}-country`}
            {...form.register(`${addressPrefix}.country` as const)}
            disabled={isDisabled}
            defaultValue="India"
            aria-invalid={
              form.formState.errors[addressPrefix]?.country ? "true" : "false"
            }
          />
          {form.formState.errors[addressPrefix]?.country && (
            <p className="text-xs text-destructive">
              {form.formState.errors[addressPrefix]?.country?.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

