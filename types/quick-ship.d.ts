// Re-export the type from schema to avoid circular dependency
export type { QuickShipFormData } from "@/lib/quick-ship-schema";

export type AddressFormData = {
  locationType: "saved" | "one-time";
  locationId?: string;
  full_name: string;
  email: string;
  calling_code: string;
  contact: string;
  address_line_1: string;
  address_line_2?: string;
  pincode: string;
  city: string;
  state: string;
  country: string;
};

export type ProductFormData = {
  branch_id: string;
  product_name: string;
  product_weight: number;
  product_value: number;
  reference1?: string;
  reference2?: string;
  quantity: number;
  cod_value?: number;
};

export type PackageFormData = {
  package_description: string;
  length: number;
  breadth: number;
  height: number;
  dimensions_unit: "inch" | "cm";
  weight?: number;
  quantity: number;
};

export type QuickShipOptions = {
  serviceType: "domestic";
  shipmentType: "forward";
  transportMode: "express" | "surface";
  weightType: "light_weight";
  paymentType?: "prepaid" | "cod";
};

// API Request/Response Types
export type QuickShipQuoteRequest = {
  gst_branch_id: string;
  shipment_data: Array<{
    origin_address: {
      location_id: string;
      full_name: string;
      email: string;
      calling_code: string;
      contact: string;
      pincode: string;
      address_line_1: string;
      address_line_2: string;
      city: string;
      state: string;
      country: string;
    };
    destination_address: {
      location_id: string;
      full_name: string;
      email: string;
      calling_code: string;
      contact: string;
      pincode: string;
      address_line_1: string;
      address_line_2: string;
      city: string;
      state: string;
      country: string;
    };
    billing_address: {
      location_id: string;
      full_name: string;
      email: string;
      calling_code: string;
      contact: string;
      pincode: string;
      address_line_1: string;
      address_line_2: string;
      city: string;
      state: string;
      country: string;
    };
    return_address: {
      location_id: string;
      full_name: string;
      email: string;
      calling_code: string;
      contact: string;
      pincode: string;
      address_line_1: string;
      address_line_2: string;
      city: string;
      state: string;
      country: string;
    };
    shipment: {
      vamaship_product_code: string;
      shipment_type: string;
      mode_transport: string;
      cargo_type: string;
      service_type: string;
      special_shipment_type: string | null;
      weight_type: string;
      reference1: string | null;
      reference2: string | null;
      is_cod: boolean;
      quality_check: boolean;
      requested_pickup_date: string;
      couponCode: boolean;
      products: Array<{
        customer_product_id: string | null;
        product_name: string;
        quantity: string;
        weight: number;
        weight_unit: string;
        product_value_with_tax: number;
        product_value_without_tax: number;
        product_tax_amount: number | null;
        product_value_currency: string;
        hsn_code: string | null;
        custom_fields: Record<string, any> | null;
        channel_name: string;
        additional_product_details: {
          color: string;
          return_reason: string;
          brand: string;
          category: string;
          ean_no: string;
          imei: string;
          special_instruction: string;
          images: [string, string, string];
        };
      }>;
      packages: Array<{
        package_description: string;
        weight: number;
        weight_unit: string;
        number_of_packages: number;
        dimensions: {
          height: string;
          breadth: string;
          length: string;
          dimensions_unit: string;
        };
      }>;
      value_added_services: {
        cod: {
          value: number;
          currency: string;
          payment_mode: string;
        };
        testing_charge: number;
        ddp: null;
        last_mile_locations: null;
        commodity_diamonds: null;
        usa_ior: null;
        digital_pod: null;
        reverse_with_qc: null;
        saturday_delivery: null;
        qc_product_id: null;
        qc_product_value: null;
      };
    };
  }>;
};

// Quote Response Types
export type GSTBreakupItem = {
  sac: string;
  taxable: number;
  gst: string;
  igst: number;
  cgst: number;
  sgst: number;
  total_gst: number;
};

export type GSTBreakup = {
  [chargeHead: string]: GSTBreakupItem;
};

export type QuoteGST = {
  gst_breakup: GSTBreakup;
  total_without_gst: number;
  total_gst: number;
  total_cgst: number;
  total_sgst: number;
  total_igst: number;
};

export type ChargeHeads = {
  freight: number;
  fuel_surcharge: number;
  [key: string]: number;
};

export type QuoteData = {
  quote: {
    charge_heads: ChargeHeads;
    gst: QuoteGST;
    total_without_tax: number;
    total_tax: number;
    total_gst: number;
    total_cost: number;
    totalCost: number;
    zone: string;
    volumetric_weight: number;
    actual_weight: number;
    applied_weight: number;
    slab_count: number;
    supplier_id: number;
    estimated_delivery_date: string;
    quote_id: string | null;
  };
  total_without_tax: number;
  total_tax: number;
  total_gst: number;
  total_cost: number;
  totalCost: number;
  zone: string;
  volumetric_weight: number;
  actual_weight: number;
  applied_weight: number;
  slab_count: number;
  supplier_id: number;
  estimated_delivery_date: string;
  quote_id: string | null;
};

export type OrderQuote = {
  [supplierId: string]: QuoteData;
  other_quotes?: {
    [supplierId: string]: QuoteData;
  };
  quote_id?: string;
};

export type QuoteResponseData = {
  orders: OrderQuote[];
  other_quotes: {
    [supplierId: string]: QuoteData;
  };
  booking_reference_no: string;
  failed: number[];
  succeeded: number[];
  quote_id: number;
};

export type QuoteResponseMeta = {
  status_code: number;
  status: string;
  message: string;
};

export type QuickShipQuoteResponse = {
  data: QuoteResponseData;
  meta: QuoteResponseMeta;
};

export type PincodeLookupResult = {
  city: string;
  state: string;
  country: string;
};

