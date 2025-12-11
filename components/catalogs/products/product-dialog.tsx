"use client";

import { useState, useEffect } from "react";
import { type ProductType } from "@/types/products";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createProduct, updateProduct } from "@/api/products";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductType | null;
  onSave: (data: Partial<ProductType>) => void;
}

type ImageItem = {
  src: string;
};

type AttributeItem = {
  identifier: string;
  value: string;
};

type FormData = {
  product_name: string;
  product_type: string;
  sku: string;
  price: string;
  currency: string;
  weight: string;
  weight_unit: string;
  images: ImageItem[];
  additional_attributes: AttributeItem[];
};

export function ProductDialog({
  open,
  onOpenChange,
  product,
  onSave,
}: ProductDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FormData>({
    product_name: "",
    product_type: "",
    sku: "",
    price: "",
    currency: "INR",
    weight: "",
    weight_unit: "Kg",
    images: [{ src: "" }],
    additional_attributes: [{ identifier: "", value: "" }],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      // Edit mode - populate form with existing data
      const productImages = (product as any).product_images || [];
      const productAttributes = (product as any).additional_attributes || [];
      
      setFormData({
        product_name: product.product_name || "",
        product_type: product.product_type || "",
        sku: product.sku || "",
        price: String(product.price || ""),
        currency: product.currency || "INR",
        weight: String(product.weight || product.weight_in_kgs || ""),
        weight_unit: product.weight_unit || "Kg",
        images:
          productImages.length > 0
            ? productImages.map((img: any) => ({
                src: img.src || img,
              }))
            : [{ src: "" }],
        additional_attributes:
          productAttributes.length > 0
            ? productAttributes.map((attr: any) => ({
                identifier: attr.identifier || "",
                value: attr.value || "",
              }))
            : [{ identifier: "", value: "" }],
      });
    } else {
      // Reset form for new product
      setFormData({
        product_name: "",
        product_type: "",
        sku: "",
        price: "",
        currency: "INR",
        weight: "",
        weight_unit: "Kg",
        images: [{ src: "" }],
        additional_attributes: [{ identifier: "", value: "" }],
      });
    }
  }, [product, open]);

  const addImage = () => {
    setFormData({
      ...formData,
      images: [...formData.images, { src: "" }],
    });
  };

  const removeImage = (index: number) => {
    if (formData.images.length > 1) {
      setFormData({
        ...formData,
        images: formData.images.filter((_, i) => i !== index),
      });
    }
  };

  const updateImage = (index: number, src: string) => {
    const newImages = [...formData.images];
    newImages[index] = { src };
    setFormData({ ...formData, images: newImages });
  };

  const addAttribute = () => {
    setFormData({
      ...formData,
      additional_attributes: [
        ...formData.additional_attributes,
        { identifier: "", value: "" },
      ],
    });
  };

  const removeAttribute = (index: number) => {
    if (formData.additional_attributes.length > 1) {
      setFormData({
        ...formData,
        additional_attributes: formData.additional_attributes.filter(
          (_, i) => i !== index,
        ),
      });
    }
  };

  const updateAttribute = (
    index: number,
    field: "identifier" | "value",
    value: string,
  ) => {
    const newAttributes = [...formData.additional_attributes];
    newAttributes[index] = { ...newAttributes[index], [field]: value };
    setFormData({ ...formData, additional_attributes: newAttributes });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      if (product?.id) {
        // Edit mode - use PUT API
        // Filter out empty images
        const validImages = formData.images
          .filter((img) => img.src.trim() !== "")
          .map((img) => ({ src: img.src.trim() }));

        const productData = {
          product_name: formData.product_name,
          brand: null,
          product_type: formData.product_type,
          price: formData.price,
          currency: formData.currency,
          sku: formData.sku,
          hsn_code: null,
          weight: formData.weight,
          weight_unit: formData.weight_unit,
          inventory_quantity: null,
          product_images:
            validImages.length > 0 ? validImages : null,
        };

        await updateProduct(product.id, productData);
        toast.success("Product updated successfully");
      } else {
        // Add mode - use POST API
        // Filter out empty images
        const validImages = formData.images
          .filter((img) => img.src.trim() !== "")
          .map((img) => ({ src: img.src.trim() }));

        // Filter out empty attributes
        const validAttributes = formData.additional_attributes
          .filter(
            (attr) => attr.identifier.trim() !== "" && attr.value.trim() !== "",
          )
          .map((attr) => ({
            identifier: attr.identifier.trim(),
            value: attr.value.trim(),
          }));

        const productData = {
          product_name: formData.product_name,
          brand: "",
          product_type: formData.product_type,
          price: formData.price,
          currency: formData.currency,
          sku: formData.sku,
          hsn_code: 0,
          weight: formData.weight,
          weight_unit: formData.weight_unit,
          inventory_quantity: 0,
          length: 0,
          breadth: 0,
          height: 0,
          unit: "cm",
          product_images: validImages.length > 0 ? validImages : undefined,
          additional_attributes:
            validAttributes.length > 0 ? validAttributes : undefined,
        };

        await createProduct(productData);
        toast.success("Product created successfully");
      }
      // Invalidate queries to refetch data
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      onSave({});
      onOpenChange(false);
    } catch (error) {
      toast.error(
        product?.id ? "Failed to update product" : "Failed to create product",
      );
      console.error("Error saving product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add Product"}</DialogTitle>
          <DialogDescription>
            {product ? "Update product details" : "Create a new product"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product_name">Product Description</Label>
              <Input
                id="product_name"
                value={formData.product_name}
                onChange={(e) =>
                  setFormData({ ...formData, product_name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product_type">Product Type</Label>
              <Input
                id="product_type"
                value={formData.product_type}
                onChange={(e) =>
                  setFormData({ ...formData, product_type: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Product Value</Label>
              <div className="flex gap-2">
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                  className="flex-1"
                />
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    setFormData({ ...formData, currency: value })
                  }
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (KG)</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                value={formData.weight}
                onChange={(e) =>
                  setFormData({ ...formData, weight: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Images</Label>
            {formData.images.map((image, index) => (
              <div key={index} className="flex gap-2 items-end">
                <Input
                  type="url"
                  value={image.src}
                  onChange={(e) => updateImage(index, e.target.value)}
                  placeholder="Enter image URL"
                  className="flex-1"
                />
                {formData.images.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeImage(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="link"
              onClick={addImage}
              className="text-blue-600 p-0 h-auto"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add another image item
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Additional Attributes</Label>
            {formData.additional_attributes.map((attr, index) => (
              <div key={index} className="grid grid-cols-2 gap-2">
                <Input
                  value={attr.identifier}
                  onChange={(e) =>
                    updateAttribute(index, "identifier", e.target.value)
                  }
                  placeholder={`Identifier ${index + 1}`}
                />
                <div className="flex gap-2">
                  <Input
                    value={attr.value}
                    onChange={(e) =>
                      updateAttribute(index, "value", e.target.value)
                    }
                    placeholder={`Identifier ${index + 1} - Value`}
                    className="flex-1"
                  />
                  {formData.additional_attributes.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAttribute(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="link"
              onClick={addAttribute}
              className="text-blue-600 p-0 h-auto"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add another attribute item
            </Button>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? product
                  ? "Saving..."
                  : "Adding..."
                : product
                  ? "Save"
                  : "Add Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

