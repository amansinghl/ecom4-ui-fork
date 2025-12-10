"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { quickShipFormSchema, QuickShipFormData } from "@/lib/quick-ship-schema";
import { getQuote } from "@/api/orders";
import { QuickShipQuoteRequest } from "@/types/quick-ship";
import { toast } from "sonner";

// Get vamaship product code based on shipment type, transport mode, and business type
// Based on the old OrderTransformer logic
function getVamashipProductCode(
  shipmentType: "forward" | "reverse",
  transportMode: "express" | "surface",
  businessType?: "b2c" | "b2b",
): string {
  let productCode = "P001"; // Default for express forward

  // Surface mode: B2C uses P004, B2B uses P005
  if (transportMode === "surface") {
    if (businessType === "b2b") {
      productCode = "P005"; // B2B Surface
    } else {
      productCode = "P004"; // B2C Surface (default for surface)
    }
  }

  // Reverse shipments use P004 (or P092 if quality check, but we don't have that yet)
  if (shipmentType === "reverse") {
    productCode = "P004";
  }

  return productCode;
}

// Transform form data to API request format
function transformFormDataToRequest(
  formData: QuickShipFormData,
): QuickShipQuoteRequest {
  // Calculate volumetric weight
  const { length, breadth, height, dimensions_unit, quantity: packageQuantity } = formData.package;
  const volume = length * breadth * height;
  const divisor = dimensions_unit === "cm" ? 5000 : 305;
  const volumetricWeight = volume / divisor;

  // Use entered weight or volumetric weight (whichever is higher)
  const packageWeight = formData.package.weight || volumetricWeight;

  return {
    gst_branch_id: formData.branch_id,
    shipment_data: [
      {
        origin_address: {
          location_id: formData.originAddress.locationId || "",
          full_name: formData.originAddress.full_name,
          email: formData.originAddress.email,
          calling_code: formData.originAddress.calling_code,
          contact: formData.originAddress.contact,
          pincode: formData.originAddress.pincode,
          address_line_1: formData.originAddress.address_line_1,
          address_line_2: formData.originAddress.address_line_2 || "",
          city: formData.originAddress.city,
          state: formData.originAddress.state,
          country: formData.originAddress.country,
        },
        destination_address: {
          location_id: formData.destinationAddress.locationId || "",
          full_name: formData.destinationAddress.full_name,
          email: formData.destinationAddress.email,
          calling_code: formData.destinationAddress.calling_code,
          contact: formData.destinationAddress.contact,
          pincode: formData.destinationAddress.pincode,
          address_line_1: formData.destinationAddress.address_line_1,
          address_line_2: formData.destinationAddress.address_line_2 || "",
          city: formData.destinationAddress.city,
          state: formData.destinationAddress.state,
          country: formData.destinationAddress.country,
        },
        billing_address: {
          location_id: formData.originAddress.locationId || "",
          full_name: formData.originAddress.full_name,
          email: formData.originAddress.email,
          calling_code: formData.originAddress.calling_code,
          contact: formData.originAddress.contact,
          pincode: formData.originAddress.pincode,
          address_line_1: formData.originAddress.address_line_1,
          address_line_2: formData.originAddress.address_line_2 || "",
          city: formData.originAddress.city,
          state: formData.originAddress.state,
          country: formData.originAddress.country,
        },
        return_address: formData.useDifferentReturnAddress && formData.returnAddress
          ? {
              location_id: formData.returnAddress.locationId || "",
              full_name: formData.returnAddress.full_name,
              email: formData.returnAddress.email,
              calling_code: formData.returnAddress.calling_code,
              contact: formData.returnAddress.contact,
              pincode: formData.returnAddress.pincode,
              address_line_1: formData.returnAddress.address_line_1,
              address_line_2: formData.returnAddress.address_line_2 || "",
              city: formData.returnAddress.city,
              state: formData.returnAddress.state,
              country: formData.returnAddress.country,
            }
          : {
              location_id: formData.originAddress.locationId || "",
              full_name: formData.originAddress.full_name,
              email: formData.originAddress.email,
              calling_code: formData.originAddress.calling_code,
              contact: formData.originAddress.contact,
              pincode: formData.originAddress.pincode,
              address_line_1: formData.originAddress.address_line_1,
              address_line_2: formData.originAddress.address_line_2 || "",
              city: formData.originAddress.city,
              state: formData.originAddress.state,
              country: formData.originAddress.country,
            },
        shipment: {
          vamaship_product_code: getVamashipProductCode(
            formData.shipmentType,
            formData.transportMode,
            formData.businessType,
          ),
          shipment_type: formData.shipmentType,
          mode_transport: formData.transportMode,
          cargo_type: "general",
          service_type: "domestic",
          special_shipment_type: null,
          weight_type: "light_weight",
          reference1: formData.reference1 || null,
          reference2: formData.reference2 || null,
          is_cod: formData.paymentType === "cod",
          quality_check: false,
          requested_pickup_date: new Date().toISOString().split("T")[0],
          couponCode: false,
          products: formData.products.map((product) => ({
            customer_product_id: null,
            product_name: product.product_name,
            quantity: product.quantity.toString(),
            weight: product.product_weight,
            weight_unit: "KG",
            product_value_with_tax: product.product_value,
            product_value_without_tax: product.product_value,
            product_tax_amount: null,
            product_value_currency: "INR",
            hsn_code: null,
            custom_fields: null,
            channel_name: "Vamaship",
            additional_product_details: {
              color: "",
              return_reason: "",
              brand: "",
              category: "",
              ean_no: "",
              imei: "",
              special_instruction: "",
              images: ["", "", ""],
            },
          })),
          packages: [
            {
              package_description: formData.package.package_description,
              weight: packageWeight,
              weight_unit: "KG",
              number_of_packages: packageQuantity,
              dimensions: {
                height: height.toString(),
                breadth: breadth.toString(),
                length: length.toString(),
                dimensions_unit: dimensions_unit,
              },
            },
          ],
          value_added_services: {
            cod: {
              value: formData.paymentType === "cod" ? (formData.cod_value || 0) : 0,
              currency: "INR",
              payment_mode: formData.paymentType === "cod" ? "cod" : "prepaid",
            },
            testing_charge: 1,
            ddp: null,
            last_mile_locations: null,
            commodity_diamonds: null,
            usa_ior: null,
            digital_pod: null,
            reverse_with_qc: null,
            saturday_delivery: null,
            qc_product_id: null,
            qc_product_value: null,
          },
        },
      },
    ],
  };
}

export function useQuickShip(defaultBranchId: string) {
  const form = useForm<QuickShipFormData>({
    resolver: zodResolver(quickShipFormSchema),
    defaultValues: {
      shipmentType: "forward",
      transportMode: "express",
      businessType: undefined,
      paymentType: "prepaid",
      originAddress: {
        locationType: "saved",
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
      },
      destinationAddress: {
        locationType: "saved",
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
      },
      useDifferentReturnAddress: false,
      returnAddress: undefined,
      branch_id: defaultBranchId || "",
      reference1: "",
      reference2: "",
      cod_value: undefined,
      products: [
        {
          product_name: "",
          product_weight: 0.01,
          product_value: 0,
          quantity: 1,
        },
      ],
      package: {
        package_description: "",
        length: 1,
        breadth: 1,
        height: 1,
        dimensions_unit: "inch",
        quantity: 1,
      },
    },
    mode: "onChange",
  });

  const mutation = useMutation({
    mutationFn: (data: QuickShipFormData) => {
      const requestData = transformFormDataToRequest(data);
      return getQuote(requestData);
    },
    onSuccess: () => {
      toast.success("Quote generated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to generate quote");
    },
  });

  const onSubmit = form.handleSubmit(
    (data: QuickShipFormData) => {
      console.log("Form submitted with data:", data);
      const requestData = transformFormDataToRequest(data);
      console.log("Transformed request data:", requestData);
      mutation.mutate(data);
    },
    (errors) => {
      console.error("Form validation errors:", errors);
      toast.error("Please fix the form errors before submitting");
    }
  );

  return {
    form,
    onSubmit,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

