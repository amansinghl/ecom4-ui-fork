"use client";

import { useState, useEffect } from "react";
import { type LocationType } from "@/types/locations";
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

interface LocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location?: LocationType | null;
  onSave: (data: Partial<LocationType>) => void;
}

export function LocationDialog({
  open,
  onOpenChange,
  location,
  onSave,
}: LocationDialogProps) {
  const [formData, setFormData] = useState({
    location_name: "",
    location_type: "",
    full_name: "",
    email: "",
    country: "India",
    calling_code: "91",
    contact: "",
    address: "",
    pincode: "",
    city: "",
    state: "",
  });

  useEffect(() => {
    if (location) {
      // Combine address lines for editing
      const addressParts = [
        location.address_line_1,
        location.address_line_2,
        location.landmark,
      ]
        .filter(Boolean)
        .join(", ");

      setFormData({
        location_name: location.location_name || "",
        location_type: location.location_type || "",
        full_name: location.full_name || "",
        email: location.email || "",
        country: location.country || "India",
        calling_code: location.calling_code || "91",
        contact: location.contact || "",
        address: addressParts || "",
        pincode: location.pincode || "",
        city: location.city || "",
        state: location.state || "",
      });
    } else {
      // Reset form for new location
      setFormData({
        location_name: "",
        location_type: "",
        full_name: "",
        email: "",
        country: "India",
        calling_code: "91",
        contact: "",
        address: "",
        pincode: "",
        city: "",
        state: "",
      });
    }
  }, [location, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Split address into address_line_1 and address_line_2 (max 200 chars)
    const addressParts = formData.address.slice(0, 200).split(", ");
    const address_line_1 = addressParts[0] || "";
    const address_line_2 = addressParts.slice(1).join(", ") || null;

    const locationData: Partial<LocationType> = {
      location_name: formData.location_name,
      location_type: formData.location_type || null,
      full_name: formData.full_name || null,
      email: formData.email || null,
      country: formData.country || null,
      calling_code: formData.calling_code || null,
      contact: formData.contact || null,
      address_line_1: address_line_1 || null,
      address_line_2: address_line_2,
      pincode: formData.pincode || null,
      city: formData.city || null,
      state: formData.state || null,
    };

    if (location?.id) {
      locationData.id = location.id;
    }

    onSave(locationData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{location ? "Edit Location" : "Add Location"}</DialogTitle>
          <DialogDescription>
            Manage your address book entries
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location_name">Location Name</Label>
              <Input
                id="location_name"
                value={formData.location_name}
                onChange={(e) =>
                  setFormData({ ...formData, location_name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location_type">Location Type</Label>
              <Select
                value={formData.location_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, location_type: value })
                }
              >
                <SelectTrigger id="location_type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">Both</SelectItem>
                  <SelectItem value="origin">Origin</SelectItem>
                  <SelectItem value="destination">Destination</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Representative Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="calling_code">ISD Code</Label>
              <Input
                id="calling_code"
                value={formData.calling_code}
                onChange={(e) =>
                  setFormData({ ...formData, calling_code: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">Phone</Label>
              <Input
                id="contact"
                type="tel"
                value={formData.contact}
                onChange={(e) =>
                  setFormData({ ...formData, contact: e.target.value })
                }
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">
                Address
                <span className="text-muted-foreground text-xs ml-2">
                  Max 200 chars. We will split automatically.
                </span>
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value.slice(0, 200) })
                }
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                value={formData.pincode}
                onChange={(e) =>
                  setFormData({ ...formData, pincode: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
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
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

