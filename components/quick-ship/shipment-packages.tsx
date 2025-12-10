"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { QuickShipFormData } from "@/lib/quick-ship-schema";
import { usePackages } from "@/hooks/use-packages";
import { PackageType } from "@/types/packages";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2, HelpCircle } from "lucide-react";

interface ShipmentPackagesProps {
  form: UseFormReturn<QuickShipFormData>;
}

export function ShipmentPackages({ form }: ShipmentPackagesProps) {
  const { data: packagesData, isLoading: packagesLoading } = usePackages();
  const packages = (packagesData as any)?.packages?.data ?? [];

  const length = form.watch("package.length");
  const breadth = form.watch("package.breadth");
  const height = form.watch("package.height");
  const dimensionsUnit = form.watch("package.dimensions_unit");
  const quantity = form.watch("package.quantity") || 1;

  const [packageInputValue, setPackageInputValue] = useState(
    form.watch("package.package_description") || ""
  );
  const [showPackageDropdown, setShowPackageDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const packageInputRef = useRef<HTMLInputElement>(null);
  const packageDropdownRef = useRef<HTMLDivElement>(null);

  const filteredPackages = packageInputValue
    ? packages.filter((pkg: PackageType) =>
        (pkg.package_identifier || `Package ${pkg.id}`)
          .toLowerCase()
          .includes(packageInputValue.toLowerCase())
      )
    : packages;

  useEffect(() => {
    form.setValue("package.package_description", packageInputValue);
  }, [packageInputValue, form]);

  const handlePackageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPackageInputValue(value);
    setShowPackageDropdown(value.length > 0 && filteredPackages.length > 0);
    setFocusedIndex(-1);
  };

  const handlePackageSelect = (pkg: PackageType) => {
    const displayName = pkg.package_identifier || `Package ${pkg.id}`;
    const formValue = pkg.package_identifier || pkg.id.toString();
    setPackageInputValue(displayName);
    form.setValue("package.package_description", formValue);
    
    if (pkg.length) {
      const length = typeof pkg.length === "string" ? parseFloat(pkg.length) : pkg.length;
      if (!isNaN(length) && length > 0) {
        form.setValue("package.length", length);
      }
    }
    if (pkg.breadth) {
      const breadth = typeof pkg.breadth === "string" ? parseFloat(pkg.breadth) : pkg.breadth;
      if (!isNaN(breadth) && breadth > 0) {
        form.setValue("package.breadth", breadth);
      }
    }
    if (pkg.height) {
      const height = typeof pkg.height === "string" ? parseFloat(pkg.height) : pkg.height;
      if (!isNaN(height) && height > 0) {
        form.setValue("package.height", height);
      }
    }
    if (pkg.unit && (pkg.unit === "inch" || pkg.unit === "cm")) {
      form.setValue("package.dimensions_unit", pkg.unit);
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

  // Calculate volumetric weight
  // Formula: (L × B × H) / 5000 for cm, or (L × B × H) / 305 for inch
  const volumetricWeight = useMemo(() => {
    if (!length || !breadth || !height) return 0;

    const volume = length * breadth * height;
    const divisor = dimensionsUnit === "cm" ? 5000 : 305;
    const volWeight = volume / divisor;

    return Math.round(volWeight * 100) / 100;
  }, [length, breadth, height, dimensionsUnit]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2 items-end">
        <div className="space-y-1.5 relative">
          <div className="flex items-center gap-1">
            <Label htmlFor="package_description" className="text-xs">
              Package Name <span className="text-destructive">*</span>
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Type the package name or select from your saved packages. Start typing to see matching packages.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="relative">
            <Input
              ref={packageInputRef}
              id="package_description"
              placeholder="Type package name or select from list"
              value={packageInputValue}
              onChange={handlePackageInputChange}
              onFocus={() => {
                if (packageInputValue && filteredPackages.length > 0) {
                  setShowPackageDropdown(true);
                }
              }}
              onKeyDown={handlePackageKeyDown}
              aria-invalid={
                form.formState.errors.package?.package_description ? "true" : "false"
              }
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
          {form.formState.errors.package?.package_description && (
            <p className="text-xs text-destructive">
              {form.formState.errors.package?.package_description?.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
            <Label className="text-xs">
              L × B × H <span className="text-destructive">*</span>
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Enter package dimensions: Length × Breadth × Height in the selected unit (inch or cm)</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-1">
            <Input
              id="length"
              type="text"
              inputMode="decimal"
              placeholder="L"
              className="w-full"
              {...form.register("package.length", {
                setValueAs: (value) => {
                  const num = parseFloat(value);
                  return isNaN(num) ? undefined : num;
                },
              })}
              onBlur={(e) => {
                const value = e.target.value;
                if (value) {
                  const num = parseFloat(value);
                  if (!isNaN(num) && num >= 1) {
                    form.setValue("package.length", num);
                  }
                }
              }}
              aria-invalid={
                form.formState.errors.package?.length ? "true" : "false"
              }
            />
            <span className="text-xs text-muted-foreground">×</span>
            <Input
              id="breadth"
              type="text"
              inputMode="decimal"
              placeholder="B"
              className="w-full"
              {...form.register("package.breadth", {
                setValueAs: (value) => {
                  const num = parseFloat(value);
                  return isNaN(num) ? undefined : num;
                },
              })}
              onBlur={(e) => {
                const value = e.target.value;
                if (value) {
                  const num = parseFloat(value);
                  if (!isNaN(num) && num >= 1) {
                    form.setValue("package.breadth", num);
                  }
                }
              }}
              aria-invalid={
                form.formState.errors.package?.breadth ? "true" : "false"
              }
            />
            <span className="text-xs text-muted-foreground">×</span>
            <Input
              id="height"
              type="text"
              inputMode="decimal"
              placeholder="H"
              className="w-full"
              {...form.register("package.height", {
                setValueAs: (value) => {
                  const num = parseFloat(value);
                  return isNaN(num) ? undefined : num;
                },
              })}
              onBlur={(e) => {
                const value = e.target.value;
                if (value) {
                  const num = parseFloat(value);
                  if (!isNaN(num) && num >= 1) {
                    form.setValue("package.height", num);
                  }
                }
              }}
              aria-invalid={
                form.formState.errors.package?.height ? "true" : "false"
              }
            />
          </div>
          {(form.formState.errors.package?.length ||
            form.formState.errors.package?.breadth ||
            form.formState.errors.package?.height) && (
            <p className="text-xs text-destructive">
              {form.formState.errors.package?.length?.message ||
                form.formState.errors.package?.breadth?.message ||
                form.formState.errors.package?.height?.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
            <Label className="text-xs">Unit</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Select the unit of measurement for dimensions: Inches or Centimeters</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <ToggleGroup
            type="single"
            value={dimensionsUnit || "inch"}
            onValueChange={(value) => {
              if (value) {
                form.setValue("package.dimensions_unit", value as "inch" | "cm");
              }
            }}
            className="grid grid-cols-2 gap-2"
          >
            <ToggleGroupItem
              value="inch"
              aria-label="Inch"
              className="h-9 text-sm data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              Inch
            </ToggleGroupItem>
            <ToggleGroupItem
              value="cm"
              aria-label="Centimeter"
              className="h-9 text-sm data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              Cm
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
            <Label htmlFor="volumetric_weight" className="text-xs">Vol. Weight (KG)</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Automatically calculated based on dimensions. Formula: (L × B × H) / 5000 (cm) or / 305 (inch)</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="volumetric_weight"
            type="text"
            value={volumetricWeight.toFixed(2)}
            disabled
            className="bg-muted"
          />
        </div>
      </div>
    </div>
  );
}

