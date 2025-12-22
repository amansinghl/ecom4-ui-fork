import type { QuickShipQuoteRequest } from "@/types/quick-ship";
import type { QuickShipFormData } from "@/lib/quick-ship-schema";
import type { OrderType } from "@/types/orders";
import type { LocationType } from "@/types/locations";
import type { LineItem } from "@/api/orders";

function getVamashipProductCode(
  shipmentType: "forward" | "reverse",
  transportMode: "express" | "surface",
  businessType?: "b2c" | "b2b",
): string {
  let productCode = "P001";

  if (transportMode === "surface") {
    if (businessType === "b2b") {
      productCode = "P005";
    } else {
      productCode = "P004";
    }
  }

  if (shipmentType === "reverse") {
    productCode = "P004";
  }

  return productCode;
}

export function transformQuickShipToQuoteRequest(
  formData: QuickShipFormData,
): QuickShipQuoteRequest {
  const { length, breadth, height, dimensions_unit, quantity: packageQuantity } = formData.package;
  const volume = length * breadth * height;
  const divisor = dimensions_unit === "cm" ? 5000 : 305;
  const volumetricWeight = volume / divisor;
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
          product_value: formData.products.reduce((sum, p) => sum + (p.product_value || 0), 0).toString(),
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
                height: Number(height),
                breadth: Number(breadth),
                length: Number(length),
                dimensions_unit: dimensions_unit,
              },
            },
          ],
          value_added_services: {
            cod: {
              value: formData.paymentType === "cod" ? String(formData.cod_value || 0) : "0.00",
              currency: "INR",
              payment_mode: formData.paymentType === "cod" ? "COD" : "prepaid",
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

function fixOrderWeights(orders: OrderType[], lineItems: Record<string, LineItem[]>): OrderType[] {
  return orders.map((order) => {
    const items = lineItems[order.id.toString()] || [];
    const lineItemWeight = items.reduce((total, item) => {
      const w = parseFloat(String(item.weight_in_kgs || 0));
      return (isNaN(w) ? 0 : w) + total;
    }, 0);
    
    const orderWeight = parseFloat(String(order.weight_in_kgs || 0));
    if (orderWeight < lineItemWeight) {
      return {
        ...order,
        weight_in_kgs: lineItemWeight,
      };
    }
    
    return order;
  });
}

export function transformOrdersToQuoteRequest(
  selectedOrders: OrderType[],
  originLocation: LocationType,
  transportMode: "express" | "surface" | "",
  businessType: "b2c" | "b2b" | "",
  gstBranchId: string,
  defaultPackage: { length: string; breadth: string; height: string; unit: string } | null,
  lineItems: Record<string, LineItem[]>,
): QuickShipQuoteRequest {
  const shipmentType: "forward" | "reverse" = "forward";
  const weightType = transportMode === "surface" && businessType === "b2c" 
    ? "light_weight" 
    : transportMode === "surface" && businessType === "b2b"
    ? "heavy_weight"
    : "light_weight";

  return {
    gst_branch_id: gstBranchId,
    shipment_data: selectedOrders.map((order) => {
      const codValue = Number(order.cod_value ?? 0);
      const isCod = codValue > 0;
      const orderWeight = Number(order.weight_in_kgs ?? 0);
      const productValue = Number(order.product_value ?? 0);
      
      const items = lineItems[order.id.toString()] || [];
      
      const products = items.length > 0
        ? items.map((item) => ({
            item_id: item.id || undefined,
            customer_product_id: null,
            product_name: (item as any).product_name || order.product || "",
            quantity: String((item as any).quantity || 1),
            weight: parseFloat(String(item.weight_in_kgs || 0)) || orderWeight,
            weight_unit: "KG",
            product_value_with_tax: parseFloat(String((item as any).product_value || 0)) || productValue,
            product_value_without_tax: parseFloat(String((item as any).product_value || 0)) || productValue,
            product_tax_amount: null,
            product_value_currency: "INR",
            hsn_code: (item as any).hsn_code || null,
            custom_fields: null,
            channel_name: order.channel_name || "",
            additional_product_details: {
              color: (item as any).color || "",
              return_reason: "",
              brand: (item as any).brand || "",
              category: (item as any).category || "",
              ean_no: (item as any).ean_no || "",
              imei: "",
              special_instruction: "",
              images: ["", "", ""] as [string, string, string],
            },
          }))
        : [
            {
              item_id: order.item_id || undefined,
              customer_product_id: null,
              product_name: order.product || "",
              quantity: "1",
              weight: orderWeight,
              weight_unit: "KG",
              product_value_with_tax: productValue,
              product_value_without_tax: productValue,
              product_tax_amount: null,
              product_value_currency: "INR",
              hsn_code: null,
              custom_fields: null,
              channel_name: order.channel_name || "",
              additional_product_details: {
                color: "",
                return_reason: "",
                brand: "",
                category: "",
                ean_no: "",
                imei: "",
                special_instruction: "",
                images: ["", "", ""] as [string, string, string],
              },
            },
          ];

      const packageLength = Number(defaultPackage?.length || 10);
      const packageBreadth = Number(defaultPackage?.breadth || 10);
      const packageHeight = Number(defaultPackage?.height || 10);
      const packageUnit = defaultPackage?.unit || "cm";

      return {
        origin_address: {
          location_id: String(originLocation.id) || "",
          full_name: originLocation.full_name || "",
          email: originLocation.email || "",
          calling_code: originLocation.calling_code || "91",
          contact: originLocation.contact || "",
          pincode: originLocation.pincode || "",
          address_line_1: originLocation.address_line_1 || "",
          address_line_2: originLocation.address_line_2 || "",
          city: originLocation.city || "",
          state: originLocation.state || "",
          country: originLocation.country || "IN",
        },
        return_address: {
          location_id: String(originLocation.id) || "",
          full_name: originLocation.full_name || "",
          email: originLocation.email || "",
          calling_code: originLocation.calling_code || "91",
          contact: originLocation.contact || "",
          pincode: originLocation.pincode || "",
          address_line_1: originLocation.address_line_1 || "",
          address_line_2: originLocation.address_line_2 || "",
          city: originLocation.city || "",
          state: originLocation.state || "",
          country: originLocation.country || "IN",
        },
        destination_address: {
          location_id: order.consignee_location_id ? Number(order.consignee_location_id) : undefined,
          consignee_name: order.dest_full_name || "",
          consignee_contact: order.dest_contact || "",
          consignee_email: order.dest_email || "",
        },
        billing_address: {
          location_id: order.billing_location_id ? Number(order.billing_location_id) : (originLocation.id ? Number(originLocation.id) : 0),
        },
        shipment: {
          order_id: order.id,
          vamaship_product_code: getVamashipProductCode(
            shipmentType,
            transportMode as "express" | "surface",
            businessType || undefined,
          ),
          shipment_type: shipmentType,
          mode_transport: transportMode as "express" | "surface",
          cargo_type: "general",
          service_type: "domestic",
          special_shipment_type: null,
          weight_type: weightType,
          product_value: String(order.product_value || "0.00"),
          reference1: order.reference1 || null,
          reference2: order.reference2 || order.id.toString() || null,
          is_cod: isCod,
          quality_check: false,
          requested_pickup_date: new Date().toISOString().split("T")[0],
          couponCode: false,
          products: products,
          packages: [
            {
              package_description: order.product || "Other",
              weight: orderWeight,
              weight_unit: "KG",
              number_of_packages: 1,
              dimensions: {
                height: packageHeight,
                breadth: packageBreadth,
                length: packageLength,
                dimensions_unit: packageUnit,
              },
            },
          ],
          value_added_services: {
            cod: {
              value: isCod ? String(codValue) : "0.00",
              currency: "INR",
              payment_mode: "COD",
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
      };
    }),
  };
}

export { fixOrderWeights };

