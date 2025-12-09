"use client";

import { useState, useEffect, useRef } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { updateLocation, getPincodeDetail, createLocation, getCountriesList } from "@/api/locations";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location?: LocationType | null;
  onSave: (data: Partial<LocationType>) => void;
}

type FormData = {
  location_name: string;
  location_type: string;
  full_name: string;
  email: string;
  country: string;
  calling_code: string;
  contact: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
};

export function LocationDialog({
  open,
  onOpenChange,
  location,
  onSave,
}: LocationDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FormData>({
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPincode, setIsLoadingPincode] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    contact?: string;
  }>({});
  const [countries, setCountries] = useState<Array<{id: number; name: string; isd_code: string}>>([]);
  const [isdCodeOpen, setIsdCodeOpen] = useState(false);
  const [isdCodeSearch, setIsdCodeSearch] = useState("");
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const originalDataRef = useRef<FormData | null>(null);
  const lastFetchedPincodeRef = useRef<string>("");

  const validateEmail = (email: string): boolean => {
    if (!email) return true; // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true; // Optional field
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  // Fetch countries list when dialog opens
  useEffect(() => {
    if (open && countries.length === 0) {
      setIsLoadingCountries(true);
      getCountriesList()
        .then((data) => {
          setCountries(data);
        })
        .catch((error) => {
          console.error("Error fetching countries:", error);
          toast.error("Failed to load countries list");
        })
        .finally(() => {
          setIsLoadingCountries(false);
        });
    }
  }, [open, countries.length]);

  // Filter countries based on search
  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(isdCodeSearch.toLowerCase()) ||
    country.isd_code.includes(isdCodeSearch) ||
    `+${country.isd_code}`.includes(isdCodeSearch)
  );

  // Get selected country display
  const selectedCountry = countries.find(
    (c) => c.isd_code === formData.calling_code
  );
  const selectedCountryDisplay = selectedCountry
    ? `+${selectedCountry.isd_code} (${selectedCountry.name})`
    : formData.calling_code
    ? `+${formData.calling_code}`
    : "Select ISD code";

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

      const initialFormData = {
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
      };

      setFormData(initialFormData);

      // Store original data for comparison
      const addressPartsOriginal = [
        location.address_line_1,
        location.address_line_2,
        location.landmark,
      ]
        .filter(Boolean)
        .join(", ");

      originalDataRef.current = {
        location_name: location.location_name || "",
        location_type: location.location_type || "",
        full_name: location.full_name || "",
        email: location.email || "",
        country: location.country || "India",
        calling_code: location.calling_code || "91",
        contact: location.contact || "",
        address: addressPartsOriginal || "",
        pincode: location.pincode || "",
        city: location.city || "",
        state: location.state || "",
      };
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
      originalDataRef.current = null;
      lastFetchedPincodeRef.current = "";
      setErrors({});
      setIsdCodeSearch("");
      setIsdCodeOpen(false);
    }
  }, [location, open]);

  const hasChanges = (): boolean => {
    if (!location || !originalDataRef.current) {
      // For new locations, always allow save
      return true;
    }

    const original = originalDataRef.current;
    return (
      formData.location_name !== original.location_name ||
      formData.location_type !== original.location_type ||
      formData.full_name !== original.full_name ||
      formData.email !== original.email ||
      formData.country !== original.country ||
      formData.calling_code !== original.calling_code ||
      formData.contact !== original.contact ||
      formData.address !== original.address ||
      formData.pincode !== original.pincode ||
      formData.city !== original.city ||
      formData.state !== original.state
    );
  };

  const fetchPincodeDetails = async (pincode: string) => {
    // Only fetch if pincode is 6 digits (Indian pincode format) and not already fetched
    if (pincode.length === 6 && /^\d+$/.test(pincode) && lastFetchedPincodeRef.current !== pincode) {
      lastFetchedPincodeRef.current = pincode;
      setIsLoadingPincode(true);
      try {
        const pincodeData = await getPincodeDetail(pincode);
        setFormData((prev) => ({
          ...prev,
          city: pincodeData.city || prev.city,
          state: pincodeData.state || prev.state,
          country: pincodeData.country || prev.country,
        }));
      } catch (error) {
        // Silently fail - don't show error toast for pincode lookup
        console.error("Error fetching pincode details:", error);
        lastFetchedPincodeRef.current = ""; // Reset on error to allow retry
      } finally {
        setIsLoadingPincode(false);
      }
    }
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPincode = e.target.value;
    setFormData({ ...formData, pincode: newPincode });
    
    // Trigger API call when 6 digits are entered
    const trimmedPincode = newPincode.trim();
    if (trimmedPincode.length === 6) {
      fetchPincodeDetails(trimmedPincode);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email and phone
    const newErrors: { email?: string; contact?: string } = {};
    
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (formData.contact && !validatePhone(formData.contact)) {
      newErrors.contact = "Please enter a valid 10-digit phone number";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the validation errors");
      return;
    }

    setErrors({});

    // For edit mode, check if there are changes
    if (location?.id && !hasChanges()) {
      toast.info("No changes detected");
      onOpenChange(false);
      return;
    }

    // Split address: if more than 99 chars, first 99 to address_line_1, rest to address_line_2
    const address = formData.address.trim();
    let address_line_1: string | null = null;
    let address_line_2: string | null = null;
    
    if (address.length > 99) {
      address_line_1 = address.slice(0, 99);
      address_line_2 = address.slice(99);
    } else if (address.length > 0) {
      address_line_1 = address;
    }

    // If editing an existing location, include all fields from original location
    // and update only the changed fields
    const locationData: Partial<LocationType> = location?.id
      ? {
          // Preserve all existing fields
          location_name: formData.location_name,
          location_type: formData.location_type || null,
          full_name: formData.full_name || null,
          email: formData.email || null,
          country: formData.country || null,
          calling_code: formData.calling_code || null,
          contact: formData.contact || null,
          address_line_1: address_line_1 || null,
          address_line_2: address_line_2,
          landmark: location.landmark ?? null,
          pincode: formData.pincode || null,
          city: formData.city || null,
          state: formData.state || null,
          visibility: location.visibility ?? null,
          channel_name: location.channel_name ?? null,
          open_time: location.open_time ?? null,
          closed_time: location.closed_time ?? null,
          lat: location.lat ?? null,
          long: location.long ?? null,
          vendor_pan_no: location.vendor_pan_no ?? null,
          vendor_gst_no: location.vendor_gst_no ?? null,
        }
      : {
          // For new locations, include all required fields
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
          visibility: 1,
          channel_name: "Vamaship",
        } as Record<string, any>;

    // If editing an existing location, call the PUT API
    if (location?.id) {
      setIsSubmitting(true);
      try {
        await updateLocation(location.id, locationData);
        toast.success("Location updated successfully");
        // Invalidate queries to refetch data
        await queryClient.invalidateQueries({ queryKey: ["locations"] });
        onSave(locationData);
        onOpenChange(false);
      } catch (error) {
        toast.error("Failed to update location");
        console.error("Error updating location:", error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // For new locations, call the POST API
      setIsSubmitting(true);
      try {
        await createLocation(locationData as Record<string, any>);
        toast.success("Location created successfully");
        // Invalidate queries to refetch data
        await queryClient.invalidateQueries({ queryKey: ["locations"] });
        onSave(locationData);
        onOpenChange(false);
      } catch (error) {
        toast.error("Failed to create location");
        console.error("Error creating location:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
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
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, email: value });
                  // Real-time validation
                  if (value && !validateEmail(value)) {
                    setErrors((prev) => ({ ...prev, email: "Please enter a valid email address" }));
                  } else {
                    setErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                onBlur={(e) => {
                  const value = e.target.value;
                  if (value && !validateEmail(value)) {
                    setErrors((prev) => ({ ...prev, email: "Please enter a valid email address" }));
                  }
                }}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
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
              <Popover open={isdCodeOpen} onOpenChange={setIsdCodeOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isdCodeOpen}
                    className="w-full justify-between"
                    type="button"
                  >
                    {isLoadingCountries ? (
                      "Loading..."
                    ) : (
                      <>
                        {selectedCountryDisplay}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <div className="flex items-center border-b px-3">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <Input
                      placeholder="Search country or code..."
                      value={isdCodeSearch}
                      onChange={(e) => setIsdCodeSearch(e.target.value)}
                      className="border-0 focus-visible:ring-0"
                    />
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {filteredCountries.length === 0 ? (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        No country found.
                      </div>
                    ) : (
                      filteredCountries.map((country) => (
                        <button
                          key={country.id}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, calling_code: country.isd_code });
                            setIsdCodeOpen(false);
                            setIsdCodeSearch("");
                          }}
                          className={cn(
                            "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                            formData.calling_code === country.isd_code && "bg-accent"
                          )}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.calling_code === country.isd_code
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <span className="font-medium">+{country.isd_code}</span>
                          <span className="ml-2 text-muted-foreground">{country.name}</span>
                        </button>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">Phone</Label>
              <Input
                id="contact"
                type="tel"
                value={formData.contact}
                onChange={(e) => {
                  // Only allow digits and limit to 10
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setFormData({ ...formData, contact: value });
                  // Real-time validation
                  if (value && !validatePhone(value)) {
                    setErrors((prev) => ({ ...prev, contact: "Please enter a valid 10-digit phone number" }));
                  } else {
                    setErrors((prev) => ({ ...prev, contact: undefined }));
                  }
                }}
                onBlur={(e) => {
                  const value = e.target.value;
                  if (value && !validatePhone(value)) {
                    setErrors((prev) => ({ ...prev, contact: "Please enter a valid 10-digit phone number" }));
                  }
                }}
                className={errors.contact ? "border-red-500" : ""}
                placeholder="10-digit phone number"
                maxLength={10}
              />
              {errors.contact && (
                <p className="text-sm text-red-500">{errors.contact}</p>
              )}
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
                onChange={handlePincodeChange}
                disabled={isLoadingPincode}
                placeholder={isLoadingPincode ? "Loading..." : ""}
                maxLength={6}
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

