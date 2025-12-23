"use client";

import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, ExternalLink, Building2, User, Mail, Phone, CreditCard, MapPin } from "lucide-react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { updatePassword, changeDefaultBranch } from "@/api/user";
import { useQueryClient } from "@tanstack/react-query";
import { BranchDialog } from "@/components/account/branch-dialog";
import { BankDialog } from "@/components/account/bank-dialog";

// Helper function to check if a string is a valid URL
const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  // Check if it's an absolute URL (http:// or https://)
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return true;
  }
  // Check if it's a relative path starting with /
  if (url.startsWith("/")) {
    return true;
  }
  // Reject invalid values like "nologo.png"
  return false;
};

export default function AccountPage() {
  const { user, isLoading } = useUser();
  const queryClient = useQueryClient();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [updatingBranchId, setUpdatingBranchId] = useState<number | null>(null);
  const [branchDialogOpen, setBranchDialogOpen] = useState(false);
  const [bankDialogOpen, setBankDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Account</h1>
          <p className="text-muted-foreground text-sm">
            Manage your account settings and details
          </p>
        </div>
        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Account</h1>
          <p className="text-muted-foreground text-sm">
            Manage your account settings and details
          </p>
        </div>
        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">No user data available</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const branches = user.branches || [];
  const banks = user.banks || [];

  const handlePasswordUpdate = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await updatePassword({
        currentPassword,
        newPassword,
      });
      toast.success("Password updated successfully");
      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update password";
      toast.error(errorMessage);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleMakeDefaultBranch = async (branchId: number) => {
    setUpdatingBranchId(branchId);
    try {
      const response = await changeDefaultBranch(branchId);
      
      // Check if there's an error in the response data
      if (response.data?.error) {
        toast.error(response.data.error);
        return;
      }
      
      // Check if the response indicates success
      if (response.data?.response === true || response.data?.message) {
        toast.success(response.data.message || "Default branch set successfully");
        // Refresh user data to get updated branch status
        await queryClient.invalidateQueries({ queryKey: ["user"] });
      } else {
        toast.error("Failed to set default branch");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to set default branch";
      toast.error(errorMessage);
    } finally {
      setUpdatingBranchId(null);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Account</h1>
          <p className="text-muted-foreground text-sm">
            Manage your account settings and details
          </p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left Column - Entity Details */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border shadow-sm">
            <CardHeader className="border-b pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="size-5 text-primary" />
                <CardTitle className="text-lg font-semibold">Entity Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Entity Information */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Entity Name
                    </Label>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">
                        {user.entity_name || "N/A"}
                      </p>
                      <ExternalLink className="size-3.5 text-primary hover:text-primary/80" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Entity Type
                    </Label>
                    <p className="text-sm font-medium">
                      {user.entity.entity_type || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Entity PAN
                    </Label>
                    <p className="text-sm font-medium font-mono">{user.entity.pan_card || "N/A"}</p>
                  </div>
                </div>

                {/* User Information */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      User Name
                    </Label>
                    <p className="text-sm font-semibold">{user.name || "N/A"}</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Email
                    </Label>
                    <p className="text-sm font-medium">{user.email || "N/A"}</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Mobile
                    </Label>
                    <p className="text-sm font-medium">
                      {user.mobile_no ? `+${user.calling_code} ${user.mobile_no}` : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Logo and Signature */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-primary uppercase tracking-wide">
                    Logo
                  </Label>
                  {isValidImageUrl(user.entity.logo) ? (
                    <div className="mt-1">
                      <Image
                        src={user.entity.logo!}
                        alt="Logo"
                        width={140}
                        height={70}
                        className="rounded-md border object-contain bg-muted/30 p-2"
                      />
                    </div>
                  ) : (
                    <div className="mt-1 flex h-20 w-full items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/20 bg-muted/30">
                      <p className="text-xs text-muted-foreground">No logo available</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-primary uppercase tracking-wide">
                    Signature
                  </Label>
                  {isValidImageUrl(user.entity.signature) ? (
                    <div className="mt-1">
                      <Image
                        src={user.entity.signature!}
                        alt="Signature"
                        width={200}
                        height={80}
                        className="rounded-md border object-contain bg-muted/30 p-2"
                      />
                    </div>
                  ) : (
                    <div className="mt-1 flex h-20 w-full items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/20 bg-muted/30">
                      <p className="text-xs text-muted-foreground">No signature available</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Password Reset */}
        <div className="space-y-4">
          <Card className="border shadow-sm h-full">
            <CardHeader className="border-b pb-3">
              <div className="flex items-center gap-2">
                <User className="size-5 text-primary" />
                <CardTitle className="text-lg font-semibold">Security</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 block">
                    Reset Password
                  </Label>
                  <div className="space-y-4">
                    <div className="space-y-2.5">
                      <Label htmlFor="current-password" className="text-xs text-muted-foreground">
                        Current Password
                      </Label>
                      <Input
                        id="current-password"
                        type="password"
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2.5">
                      <Label htmlFor="new-password" className="text-xs text-muted-foreground">
                        New Password
                      </Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2.5">
                      <Label htmlFor="confirm-password" className="text-xs text-muted-foreground">
                        Confirm Password
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <Button 
                      onClick={handlePasswordUpdate} 
                      size="sm" 
                      className="w-full mt-4"
                      disabled={isUpdatingPassword}
                    >
                      {isUpdatingPassword ? "Updating..." : "Update Password"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Full Width Cards - Billing and Bank Branches */}
      <div className="space-y-4">
        {/* Billing Branches */}
        <Card className="border shadow-sm">
          <CardHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="size-5 text-primary" />
                <CardTitle className="text-lg font-semibold">Billing Branches</CardTitle>
              </div>
              <Button size="sm" onClick={() => setBranchDialogOpen(true)}>
                <Plus className="mr-2 size-4" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-semibold h-10 border-r border-border/50 px-4">Branch Name</TableHead>
                    <TableHead className="font-semibold border-r border-border/50 px-4">Unit Type</TableHead>
                    <TableHead className="font-semibold border-r border-border/50 px-4">Registered</TableHead>
                    <TableHead className="font-semibold border-r border-border/50 px-4">GST No.</TableHead>
                    <TableHead className="font-semibold border-r border-border/50 px-4">Address</TableHead>
                    <TableHead className="font-semibold text-right px-4">Default</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branches.length > 0 ? (
                    branches.map((branch) => (
                      <TableRow key={branch.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium border-r border-border/30 px-4 py-3">{branch.branch || "N/A"}</TableCell>
                        <TableCell className="text-sm border-r border-border/30 px-4 py-3">{branch.unit_type || "N/A"}</TableCell>
                        <TableCell className="border-r border-border/30 px-4 py-3">
                          {branch.registered === 1 ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800 text-xs">
                              Yes
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">No</Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs border-r border-border/30 px-4 py-3">{branch.gst_number || "N/A"}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm border-r border-border/30 px-4 py-3">
                          {branch.address1 || branch.address2
                            ? `${branch.address1 || ""} ${branch.address2 || ""}`.trim()
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-start px-4 py-3">
                          {branch.is_default === 1 ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800 text-xs">
                              Active
                            </Badge>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-7 text-xs"
                              onClick={() => handleMakeDefaultBranch(branch.id)}
                              disabled={updatingBranchId === branch.id}
                            >
                              {updatingBranchId === branch.id ? "Updating..." : "Make Default"}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No billing branches found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Bank Branches */}
        <Card className="border shadow-sm">
          <CardHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="size-5 text-primary" />
                <div>
                  <CardTitle className="text-lg font-semibold">Bank Branches</CardTitle>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    The latest added bank is marked Active
                  </p>
                </div>
              </div>
              <Button size="sm" onClick={() => setBankDialogOpen(true)}>
                <Plus className="mr-2 size-4" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-semibold h-10 border-r border-border/50 px-4">Bank Name</TableHead>
                    <TableHead className="font-semibold border-r border-border/50 px-4">Account No.</TableHead>
                    <TableHead className="font-semibold border-r border-border/50 px-4">IFSC Code</TableHead>
                    <TableHead className="font-semibold border-r border-border/50 px-4">Beneficiary Name</TableHead>
                    <TableHead className="font-semibold text-right px-4">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banks.length > 0 ? (
                    banks.map((bank) => (
                      <TableRow key={bank.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium border-r border-border/30 px-4 py-3">{bank.bank_name || "N/A"}</TableCell>
                        <TableCell className="font-mono text-xs border-r border-border/30 px-4 py-3">{bank.account_number || "N/A"}</TableCell>
                        <TableCell className="font-mono text-xs border-r border-border/30 px-4 py-3">{bank.ifsc_code || "N/A"}</TableCell>
                        <TableCell className="font-medium border-r border-border/30 px-4 py-3">{bank.beneficiary_name || "N/A"}</TableCell>
                        <TableCell className="text-start px-4 py-3">
                          {bank.is_default === 1 ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800 text-xs">
                              Active
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No bank branches found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Branch Dialog */}
      <BranchDialog
        open={branchDialogOpen}
        onOpenChange={setBranchDialogOpen}
      />

      {/* Bank Dialog */}
      <BankDialog
        open={bankDialogOpen}
        onOpenChange={setBankDialogOpen}
      />
    </div>
  );
}
