"use client";

import { useState, useEffect, useRef } from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { QuickShipFormData } from "@/lib/quick-ship-schema";
import { useProducts } from "@/hooks/use-products";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, HelpCircle, Plus, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ShipmentProductsProps {
  form: UseFormReturn<QuickShipFormData>;
  branches?: Array<{ id: string; name: string }>;
}

export function ShipmentProducts({ form, branches = [] }: ShipmentProductsProps) {
  const { data: productsData, isLoading: productsLoading } = useProducts();
  const products = (productsData as any)?.products?.data ?? [];

  const paymentType = form.watch("paymentType");
  const showCodValue = paymentType === "cod";
  const branchOptions = branches.length > 0 ? branches : [];

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "products",
  });

  const [productInputValues, setProductInputValues] = useState<Record<number, string>>({});
  const [showProductDropdowns, setShowProductDropdowns] = useState<Record<number, boolean>>({});
  const [focusedIndices, setFocusedIndices] = useState<Record<number, number>>({});
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const dropdownRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    const initialValues: Record<number, string> = {};
    fields.forEach((field, index) => {
      const productName = form.watch(`products.${index}.product_name`) || "";
      initialValues[index] = productName;
    });
    setProductInputValues(initialValues);
  }, [fields.length]);

  const getFilteredProducts = (index: number) => {
    const inputValue = productInputValues[index] || "";
    if (!inputValue) return products;
    return products.filter((product: any) =>
      product.product_name
        ?.toLowerCase()
        .includes(inputValue.toLowerCase())
    );
  };

  const handleInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProductInputValues((prev) => ({ ...prev, [index]: value }));
    form.setValue(`products.${index}.product_name`, value);
    setShowProductDropdowns((prev) => ({
      ...prev,
      [index]: value.length > 0 && getFilteredProducts(index).length > 0,
    }));
    setFocusedIndices((prev) => ({ ...prev, [index]: -1 }));
  };

  const handleProductSelect = (index: number, productName: string) => {
    setProductInputValues((prev) => ({ ...prev, [index]: productName }));
    form.setValue(`products.${index}.product_name`, productName);
    setShowProductDropdowns((prev) => ({ ...prev, [index]: false }));
    setFocusedIndices((prev) => ({ ...prev, [index]: -1 }));
    inputRefs.current[index]?.blur();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const filteredProducts = getFilteredProducts(index);
    if (!showProductDropdowns[index] || filteredProducts.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndices((prev) => ({
        ...prev,
        [index]: Math.min((prev[index] ?? -1) + 1, filteredProducts.length - 1),
      }));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndices((prev) => ({
        ...prev,
        [index]: Math.max((prev[index] ?? -1) - 1, -1),
      }));
    } else if (e.key === "Enter" && (focusedIndices[index] ?? -1) >= 0) {
      e.preventDefault();
      const focusedIndex = focusedIndices[index] ?? -1;
      handleProductSelect(index, filteredProducts[focusedIndex].product_name || "");
    } else if (e.key === "Escape") {
      setShowProductDropdowns((prev) => ({ ...prev, [index]: false }));
      setFocusedIndices((prev) => ({ ...prev, [index]: -1 }));
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.keys(inputRefs.current).forEach((key) => {
        const index = parseInt(key);
        const inputRef = inputRefs.current[index];
        const dropdownRef = dropdownRefs.current[index];
        if (
          inputRef &&
          !inputRef.contains(event.target as Node) &&
          dropdownRef &&
          !dropdownRef.contains(event.target as Node)
        ) {
          setShowProductDropdowns((prev) => ({ ...prev, [index]: false }));
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddProduct = () => {
    append({
      product_name: "",
      product_weight: 0.01,
      product_value: 0,
      quantity: 1,
    });
    const newIndex = fields.length;
    setProductInputValues((prev) => ({ ...prev, [newIndex]: "" }));
  };

  const handleRemoveProduct = (index: number) => {
    if (fields.length > 1) {
      remove(index);
      setProductInputValues((prev) => {
        const newValues: Record<number, string> = {};
        Object.keys(prev).forEach((key) => {
          const keyNum = parseInt(key);
          if (keyNum < index) {
            newValues[keyNum] = prev[keyNum];
          } else if (keyNum > index) {
            newValues[keyNum - 1] = prev[keyNum];
          }
        });
        return newValues;
      });
    }
  };

  const totalProductValue = fields.reduce((sum, _, index) => {
    const productValue = form.watch(`products.${index}.product_value`) || 0;
    const quantity = form.watch(`products.${index}.quantity`) || 1;
    return sum + productValue * quantity;
  }, 0);

  const codValue = form.watch("cod_value");

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {branchOptions.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1">
              <Label htmlFor="branch_id" className="text-xs">
                GST Branch {branchOptions.length > 1 && <span className="text-destructive">*</span>}
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Select the GST branch for this shipment. This determines the tax and billing details.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            {branchOptions.length === 1 ? (
              <Input
                id="branch_id"
                value={branchOptions[0].name}
                disabled
                className="bg-muted"
              />
            ) : (
              <Select
                value={form.watch("branch_id") || ""}
                onValueChange={(value) => form.setValue("branch_id", value)}
              >
                <SelectTrigger id="branch_id" className="w-full">
                  <SelectValue placeholder="Select GST Branch" />
                </SelectTrigger>
                <SelectContent>
                  {branchOptions.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {form.formState.errors.branch_id && (
              <p className="text-xs text-destructive">
                {form.formState.errors.branch_id?.message}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1">
              <Label htmlFor="reference1" className="text-xs">Reference 1</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Optional: Your internal reference or order ID for tracking</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="reference1"
              {...form.register("reference1")}
              placeholder="Your identifier"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1">
              <Label htmlFor="reference2" className="text-xs">Reference 2</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Optional: Additional product details like color, size, or variant</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="reference2"
              {...form.register("reference2")}
              placeholder="E.g., Black iPhone"
            />
          </div>
        </div>

        {showCodValue && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1">
              <Label htmlFor="cod_value" className="text-xs">
                COD Value <span className="text-destructive">*</span>
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Enter the total Cash on Delivery amount. Must be less than or equal to total product value.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm text-muted-foreground pointer-events-none">
                ₹
              </span>
              <Input
                id="cod_value"
                type="text"
                inputMode="decimal"
                placeholder="0"
                className="pl-8"
                {...form.register("cod_value", {
                  setValueAs: (value) => {
                    const num = parseFloat(value);
                    return isNaN(num) ? undefined : num;
                  },
                })}
                onBlur={(e) => {
                  const value = e.target.value;
                  if (value) {
                    const num = parseFloat(value);
                    if (!isNaN(num) && num >= 0) {
                      if (num > totalProductValue) {
                        form.setValue("cod_value", totalProductValue);
                      } else {
                        form.setValue("cod_value", num);
                      }
                    }
                  }
                }}
                aria-invalid={
                  form.formState.errors.cod_value ? "true" : "false"
                }
              />
            </div>
            {form.formState.errors.cod_value && (
              <p className="text-xs text-destructive">
                {form.formState.errors.cod_value?.message}
              </p>
            )}
            {codValue !== undefined &&
              codValue > totalProductValue && (
                <p className="text-xs text-destructive">
                  COD value cannot exceed total product value (₹{totalProductValue.toFixed(2)})
                </p>
              )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => {
          const filteredProducts = getFilteredProducts(index);
          const productInputValue = productInputValues[index] || "";
          const showDropdown = showProductDropdowns[index] || false;
          const focusedIndex = focusedIndices[index] ?? -1;

          return (
            <div key={field.id} className="space-y-3">
              {index > 0 && <Separator className="my-4" />}

              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Product {index + 1}</h4>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveProduct(index)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-1.5 relative">
                <div className="flex items-center gap-1">
                  <Label htmlFor={`product_name_${index}`} className="text-xs">
                    Product Description <span className="text-destructive">*</span>
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Type the product name or select from your saved products. Start typing to see matching products.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <Input
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    id={`product_name_${index}`}
                    placeholder="Type product name or select from list"
                    value={productInputValue}
                    onChange={(e) => handleInputChange(index, e)}
                    onFocus={() => {
                      if (productInputValue && filteredProducts.length > 0) {
                        setShowProductDropdowns((prev) => ({ ...prev, [index]: true }));
                      }
                    }}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    aria-invalid={
                      form.formState.errors.products?.[index]?.product_name ? "true" : "false"
                    }
                  />
                  {showDropdown && filteredProducts.length > 0 && (
                    <div
                      ref={(el) => {
                        dropdownRefs.current[index] = el;
                      }}
                      className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto"
                    >
                      {productsLoading ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : (
                        filteredProducts.map((product: any, prodIndex: number) => (
                          <div
                            key={product.id}
                            className={`px-3 py-2 cursor-pointer text-sm hover:bg-accent ${
                              prodIndex === focusedIndex ? "bg-accent" : ""
                            }`}
                            onClick={() =>
                              handleProductSelect(index, product.product_name || "")
                            }
                            onMouseEnter={() =>
                              setFocusedIndices((prev) => ({ ...prev, [index]: prodIndex }))
                            }
                          >
                            {product.product_name}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {form.formState.errors.products?.[index]?.product_name && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.products?.[index]?.product_name?.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1">
                    <Label htmlFor={`product_weight_${index}`} className="text-xs">
                      Weight (KG) <span className="text-destructive">*</span>
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Enter the weight of the product in kilograms (e.g., 0.5, 1.2, 2.5)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id={`product_weight_${index}`}
                    type="text"
                    inputMode="decimal"
                    placeholder="0.01"
                    {...form.register(`products.${index}.product_weight`, {
                      setValueAs: (value) => {
                        const num = parseFloat(value);
                        return isNaN(num) ? undefined : num;
                      },
                    })}
                    onBlur={(e) => {
                      const value = e.target.value;
                      if (value) {
                        const num = parseFloat(value);
                        if (!isNaN(num) && num >= 0.01) {
                          form.setValue(`products.${index}.product_weight`, num);
                        }
                      }
                    }}
                    aria-invalid={
                      form.formState.errors.products?.[index]?.product_weight ? "true" : "false"
                    }
                  />
                  {form.formState.errors.products?.[index]?.product_weight && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.products?.[index]?.product_weight?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-1">
                    <Label htmlFor={`product_value_${index}`} className="text-xs">
                      Value <span className="text-destructive">*</span>
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Enter the total value of the product in Indian Rupees (e.g., 500, 1299.99)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm text-muted-foreground pointer-events-none">
                      ₹
                    </span>
                    <Input
                      id={`product_value_${index}`}
                      type="text"
                      inputMode="decimal"
                      placeholder="0"
                      className="pl-8"
                      {...form.register(`products.${index}.product_value`, {
                        setValueAs: (value) => {
                          const num = parseFloat(value);
                          return isNaN(num) ? undefined : num;
                        },
                      })}
                      onBlur={(e) => {
                        const value = e.target.value;
                        if (value) {
                          const num = parseFloat(value);
                          if (!isNaN(num) && num >= 0) {
                            form.setValue(`products.${index}.product_value`, num);
                          }
                        }
                      }}
                      aria-invalid={
                        form.formState.errors.products?.[index]?.product_value ? "true" : "false"
                      }
                    />
                  </div>
                  {form.formState.errors.products?.[index]?.product_value && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.products?.[index]?.product_value?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-1">
                    <Label htmlFor={`quantity_${index}`} className="text-xs">
                      Quantity <span className="text-destructive">*</span>
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Enter the number of items (must be at least 1)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id={`quantity_${index}`}
                    type="text"
                    inputMode="numeric"
                    placeholder="1"
                    {...form.register(`products.${index}.quantity`, {
                      setValueAs: (value) => {
                        const num = parseInt(value, 10);
                        return isNaN(num) ? undefined : num;
                      },
                    })}
                    onBlur={(e) => {
                      const value = e.target.value;
                      if (value) {
                        const num = parseInt(value, 10);
                        if (!isNaN(num) && num >= 1) {
                          form.setValue(`products.${index}.quantity`, num);
                        }
                      }
                    }}
                    aria-invalid={
                      form.formState.errors.products?.[index]?.quantity ? "true" : "false"
                    }
                  />
                  {form.formState.errors.products?.[index]?.quantity && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.products?.[index]?.quantity?.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <Button
          type="button"
          variant="outline"
          onClick={handleAddProduct}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>
    </div>
  );
}
