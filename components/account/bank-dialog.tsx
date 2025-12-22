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
import { addBank } from "@/api/user";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface BankDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FormData = {
  beneficiary_name: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
};

export function BankDialog({ open, onOpenChange }: BankDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FormData>({
    beneficiary_name: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    beneficiary_name?: string;
    bank_name?: string;
    account_number?: string;
    ifsc_code?: string;
  }>({});

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setFormData({
        beneficiary_name: "",
        bank_name: "",
        account_number: "",
        ifsc_code: "",
      });
      setErrors({});
    }
  }, [open]);

  const validateAccountNumber = (accountNumber: string): string | null => {
    const trimmed = accountNumber.trim();
    
    if (!trimmed) {
      return "The Bank Account No. field is required";
    }

    // Remove spaces and hyphens
    const cleanAccount = trimmed.replace(/[\s-]/g, "");

    // Account number should be numeric and between 9-18 digits
    if (!/^\d+$/.test(cleanAccount)) {
      return "The Bank Account No. field format is invalid";
    }

    if (cleanAccount.length < 9 || cleanAccount.length > 18) {
      return "Account number must be between 9 and 18 digits";
    }

    return null;
  };

  const validateIFSCCode = (ifsc: string): string | null => {
    const trimmedIfsc = ifsc.trim().toUpperCase();
    
    if (!trimmedIfsc) {
      return "The IFSC Code field is required";
    }

    // Remove spaces
    const cleanIfsc = trimmedIfsc.replace(/\s/g, "");

    // IFSC code format: 4 letters + 0 + 6 alphanumeric characters (total 11)
    // Pattern: ^[A-Z]{4}0[A-Z0-9]{6}$
    const ifscPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    
    if (cleanIfsc.length !== 11) {
      return "IFSC code must be exactly 11 characters";
    }

    if (!ifscPattern.test(cleanIfsc)) {
      return "The IFSC Code field format is invalid";
    }

    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: {
      beneficiary_name?: string;
      bank_name?: string;
      account_number?: string;
      ifsc_code?: string;
    } = {};

    if (!formData.beneficiary_name.trim()) {
      newErrors.beneficiary_name = "The Beneficiary field is required";
    }

    if (!formData.bank_name.trim()) {
      newErrors.bank_name = "The Bank Name field is required";
    }

    const accountError = validateAccountNumber(formData.account_number);
    if (accountError) {
      newErrors.account_number = accountError;
    }

    const ifscError = validateIFSCCode(formData.ifsc_code);
    if (ifscError) {
      newErrors.ifsc_code = ifscError;
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
      const response = await addBank({
        beneficiary_name: formData.beneficiary_name.trim(),
        bank_name: formData.bank_name.trim(),
        account_number: formData.account_number.trim().replace(/[\s-]/g, ""),
        ifsc_code: formData.ifsc_code.trim().toUpperCase().replace(/\s/g, ""),
      });
      
      // Check if there's an error in the response data
      if (response.data?.error || response.data?.errors) {
        toast.error(response.data.error || response.data.errors || "Failed to add bank");
        return;
      }
      
      // Check if the response indicates success
      if (response.data?.response === true || response.data?.message) {
        toast.success(response.data.message || "Bank added successfully");
        // Refresh user data to get updated banks
        await queryClient.invalidateQueries({ queryKey: ["user"] });
        onOpenChange(false);
      } else {
        toast.error("Failed to add bank");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add bank";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50">
          <DialogTitle className="text-xl font-semibold">Add Bank</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2.5">
              <Label htmlFor="beneficiary_name" className="text-sm font-medium">
                Beneficiary
              </Label>
              <Input
                id="beneficiary_name"
                value={formData.beneficiary_name}
                onChange={(e) => {
                  setFormData({ ...formData, beneficiary_name: e.target.value });
                  if (errors.beneficiary_name && e.target.value.trim()) {
                    setErrors({ ...errors, beneficiary_name: undefined });
                  }
                }}
                onBlur={() => {
                  if (!formData.beneficiary_name.trim()) {
                    setErrors({ ...errors, beneficiary_name: "The Beneficiary field is required" });
                  }
                }}
                className={errors.beneficiary_name ? "border-red-500 focus-visible:ring-red-500/20" : ""}
                placeholder="Enter beneficiary name"
              />
              {errors.beneficiary_name && (
                <p className="text-xs text-red-500 mt-1">{errors.beneficiary_name}</p>
              )}
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="bank_name" className="text-sm font-medium">
                Bank Name
              </Label>
              <Input
                id="bank_name"
                value={formData.bank_name}
                onChange={(e) => {
                  setFormData({ ...formData, bank_name: e.target.value });
                  if (errors.bank_name && e.target.value.trim()) {
                    setErrors({ ...errors, bank_name: undefined });
                  }
                }}
                onBlur={() => {
                  if (!formData.bank_name.trim()) {
                    setErrors({ ...errors, bank_name: "The Bank Name field is required" });
                  }
                }}
                className={errors.bank_name ? "border-red-500 focus-visible:ring-red-500/20" : ""}
                placeholder="Enter bank name"
              />
              {errors.bank_name && (
                <p className="text-xs text-red-500 mt-1">{errors.bank_name}</p>
              )}
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="account_number" className="text-sm font-medium">
                Account Number
              </Label>
              <Input
                id="account_number"
                value={formData.account_number}
                onChange={(e) => {
                  // Only allow numbers, spaces, and hyphens
                  const value = e.target.value.replace(/[^\d\s-]/g, "");
                  setFormData({ ...formData, account_number: value });
                  if (errors.account_number) {
                    const accountError = validateAccountNumber(value);
                    setErrors({ ...errors, account_number: accountError || undefined });
                  }
                }}
                onBlur={() => {
                  const accountError = validateAccountNumber(formData.account_number);
                  if (accountError) {
                    setErrors({ ...errors, account_number: accountError });
                  }
                }}
                className={errors.account_number ? "border-red-500 focus-visible:ring-red-500/20" : ""}
                placeholder="Enter account number"
                maxLength={20}
              />
              {errors.account_number && (
                <p className="text-xs text-red-500 mt-1">{errors.account_number}</p>
              )}
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="ifsc_code" className="text-sm font-medium">
                IFSC Code
              </Label>
              <Input
                id="ifsc_code"
                value={formData.ifsc_code}
                onChange={(e) => {
                  // Auto-uppercase and remove spaces
                  const value = e.target.value.toUpperCase().replace(/\s/g, "");
                  setFormData({ ...formData, ifsc_code: value });
                  if (errors.ifsc_code) {
                    const ifscError = validateIFSCCode(value);
                    setErrors({ ...errors, ifsc_code: ifscError || undefined });
                  }
                }}
                onBlur={() => {
                  const ifscError = validateIFSCCode(formData.ifsc_code);
                  if (ifscError) {
                    setErrors({ ...errors, ifsc_code: ifscError });
                  }
                }}
                className={errors.ifsc_code ? "border-red-500 focus-visible:ring-red-500/20" : ""}
                placeholder="ICIC0006255"
                maxLength={11}
              />
              {errors.ifsc_code && (
                <p className="text-xs text-red-500 mt-1">{errors.ifsc_code}</p>
              )}
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
              {isSubmitting ? "Adding..." : "Add Bank"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

