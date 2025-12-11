"use client";

import { useState, useEffect, useRef } from "react";
import { type PackageType } from "@/types/packages";
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
import { updatePackage, createPackage } from "@/api/packages";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface PackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  package: PackageType | null;
  onSave: (data: Partial<PackageType>) => void;
}

type FormData = {
  package_identifier: string;
  length: string;
  breadth: string;
  height: string;
  unit: string;
  default_package: number;
};

export function PackageDialog({
  open,
  onOpenChange,
  package: pkg,
  onSave,
}: PackageDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FormData>({
    package_identifier: "",
    length: "",
    breadth: "",
    height: "",
    unit: "cm",
    default_package: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const originalDataRef = useRef<FormData | null>(null);

  useEffect(() => {
    if (pkg) {
      const initialFormData = {
        package_identifier: pkg.package_identifier || "",
        length: String(pkg.length || ""),
        breadth: String(pkg.breadth || ""),
        height: String(pkg.height || ""),
        unit: pkg.unit || "cm",
        default_package:
          pkg.default_package === true ||
          pkg.default_package === 1 ||
          pkg.default_package === "1" ||
          String(pkg.default_package).toLowerCase() === "true"
            ? 1
            : 0,
      };

      setFormData(initialFormData);
      originalDataRef.current = initialFormData;
    } else {
      // Reset form for new package
      setFormData({
        package_identifier: "",
        length: "",
        breadth: "",
        height: "",
        unit: "cm",
        default_package: 0,
      });
      originalDataRef.current = null;
    }
  }, [pkg, open]);

  const hasChanges = (): boolean => {
    if (!pkg || !originalDataRef.current) {
      // For new packages, always allow save
      return true;
    }

    const original = originalDataRef.current;
    return (
      formData.package_identifier !== original.package_identifier ||
      formData.length !== original.length ||
      formData.breadth !== original.breadth ||
      formData.height !== original.height ||
      formData.unit !== original.unit ||
      formData.default_package !== original.default_package
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // For edit mode, check if there are changes
    if (pkg?.id && !hasChanges()) {
      toast.info("No changes detected");
      onOpenChange(false);
      return;
    }

    setIsSubmitting(true);
    try {
      if (pkg?.id) {
        // Edit mode - use PUT API
        const packageData = {
          package_identifier: formData.package_identifier,
          length: formData.length,
          breadth: formData.breadth,
          height: formData.height,
          unit: formData.unit,
          default_package: formData.default_package,
        };
        await updatePackage(pkg.id, packageData);
        toast.success("Package updated successfully");
      } else {
        // Add mode - use POST API with boolean default_package
        const packageData = {
          package_identifier: formData.package_identifier,
          length: formData.length,
          breadth: formData.breadth,
          height: formData.height,
          unit: formData.unit,
          default_package: false, // Always false for new packages
        };
        await createPackage(packageData);
        toast.success("Package created successfully");
      }
      // Invalidate queries to refetch data
      await queryClient.invalidateQueries({ queryKey: ["packages"] });
      onSave({});
      onOpenChange(false);
    } catch (error) {
      toast.error(pkg?.id ? "Failed to update package" : "Failed to create package");
      console.error("Error saving package:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{pkg ? "Edit Package" : "Add Package"}</DialogTitle>
          <DialogDescription>
            {pkg ? "Update package details" : "Create a new package"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="package_identifier">Packaging</Label>
              <Input
                id="package_identifier"
                value={formData.package_identifier}
                onChange={(e) =>
                  setFormData({ ...formData, package_identifier: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">UOM</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) =>
                  setFormData({ ...formData, unit: value })
                }
              >
                <SelectTrigger id="unit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cm">cm</SelectItem>
                  <SelectItem value="inch">in</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="length">Length</Label>
              <Input
                id="length"
                type="number"
                step="0.01"
                value={formData.length}
                onChange={(e) =>
                  setFormData({ ...formData, length: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="breadth">Breadth</Label>
              <Input
                id="breadth"
                type="number"
                step="0.01"
                value={formData.breadth}
                onChange={(e) =>
                  setFormData({ ...formData, breadth: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                type="number"
                step="0.01"
                value={formData.height}
                onChange={(e) =>
                  setFormData({ ...formData, height: e.target.value })
                }
                required
              />
            </div>
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
                ? pkg
                  ? "Saving..."
                  : "Adding..."
                : pkg
                  ? "Save"
                  : "Add Package"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

