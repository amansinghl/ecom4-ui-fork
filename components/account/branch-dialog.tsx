"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { addBranch } from "@/api/user";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface BranchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FormData = {
  branch_name: string;
  gst_number: string;
  is_default: boolean;
};

export function BranchDialog({ open, onOpenChange }: BranchDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FormData>({
    branch_name: "",
    gst_number: "",
    is_default: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    branch_name?: string;
    gst_number?: string;
  }>({});

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setFormData({
        branch_name: "",
        gst_number: "",
        is_default: false,
      });
      setErrors({});
    }
  }, [open]);

  const validateGSTNumber = (gst: string): string | null => {
    const trimmedGst = gst.trim().toUpperCase();
    
    if (!trimmedGst) {
      return "The GST No. field is required";
    }

    // Remove spaces and convert to uppercase
    const cleanGst = trimmedGst.replace(/\s/g, "");

    // GST number must be exactly 15 characters
    if (cleanGst.length !== 15) {
      return "GST number must be exactly 15 characters";
    }

    // GST number format: 2 digits (state code) + 10 alphanumeric (PAN) + 1 alphanumeric (entity) + 1 letter (usually Z) + 1 alphanumeric (check digit)
    // Pattern: ^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$
    const gstPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    
    if (!gstPattern.test(cleanGst)) {
      return "Invalid GST number format. Format: 15 characters (e.g., 27AAAAH2409K3ZT)";
    }

    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: { branch_name?: string; gst_number?: string } = {};

    if (!formData.branch_name.trim()) {
      newErrors.branch_name = "The Branch Name field is required";
    }

    const gstError = validateGSTNumber(formData.gst_number);
    if (gstError) {
      newErrors.gst_number = gstError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await addBranch({
        branch_name: formData.branch_name.trim(),
        gst_number: formData.gst_number.trim().toUpperCase(),
        is_default: formData.is_default,
        from_client: true,
      });
      
      // Check if there's an error in the response data
      if (response.data?.error) {
        toast.error(response.data.error);
        return;
      }
      
      // Check if the response indicates success
      if (response.data?.response === true || response.data?.message) {
        toast.success(response.data.message || "Branch added successfully");
        // Refresh user data to get updated branches
        await queryClient.invalidateQueries({ queryKey: ["user"] });
        onOpenChange(false);
      } else {
        toast.error("Failed to add branch");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add branch";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50">
          <DialogTitle className="text-xl font-semibold">Add Branch</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="branch_name" className="text-sm font-medium">
                Branch Name
              </Label>
              <Input
                id="branch_name"
                value={formData.branch_name}
                onChange={(e) => {
                  setFormData({ ...formData, branch_name: e.target.value });
                  if (errors.branch_name && e.target.value.trim()) {
                    setErrors({ ...errors, branch_name: undefined });
                  }
                }}
                onBlur={() => {
                  if (!formData.branch_name.trim()) {
                    setErrors({ ...errors, branch_name: "The Branch Name field is required" });
                  }
                }}
                className={errors.branch_name ? "border-red-500 focus-visible:ring-red-500/20" : ""}
                placeholder="Enter branch name"
              />
              {errors.branch_name && (
                <p className="text-xs text-red-500 mt-1">{errors.branch_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gst_number" className="text-sm font-medium">
                GST No.
              </Label>
              <Input
                id="gst_number"
                value={formData.gst_number}
                onChange={(e) => {
                  // Auto-uppercase and remove spaces
                  const value = e.target.value.toUpperCase().replace(/\s/g, "");
                  setFormData({ ...formData, gst_number: value });
                  if (errors.gst_number) {
                    const gstError = validateGSTNumber(value);
                    setErrors({ ...errors, gst_number: gstError || undefined });
                  }
                }}
                onBlur={() => {
                  const gstError = validateGSTNumber(formData.gst_number);
                  if (gstError) {
                    setErrors({ ...errors, gst_number: gstError });
                  }
                }}
                className={errors.gst_number ? "border-red-500 focus-visible:ring-red-500/20" : ""}
                placeholder="27AAAAH2409K3ZT"
                maxLength={15}
              />
              {errors.gst_number && (
                <p className="text-xs text-red-500 mt-1">{errors.gst_number}</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <Label htmlFor="is_default" className="text-sm font-medium cursor-pointer">
                Is Default
              </Label>
              <div className="flex items-center gap-3">
                <span className={`text-sm transition-colors ${!formData.is_default ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                  No
                </span>
                <Switch
                  id="is_default"
                  checked={formData.is_default}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_default: checked })
                  }
                />
                <span className={`text-sm transition-colors ${formData.is_default ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                  Yes
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-border/50 -mx-6 -mb-6 px-6 pb-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? "Adding..." : "Add Branch"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

