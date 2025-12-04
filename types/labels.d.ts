export type LabelFieldKey =
  // Branding
  | "vamashipLogo"
  | "customerLogo"
  | "partnerLogo"
  | "legalDisclaimer"
  // Shipping Information
  | "shipTo"
  | "shipToName"
  | "shipToAddress1"
  | "shipToAddress2"
  | "shipToCity"
  | "shipToPhone"
  | "shipperName"
  | "awbNumber"
  | "dimensions"
  | "paymentMethod"
  | "orderTotal"
  | "weight"
  | "ewaybillNumber"
  | "routingCode"
  | "rtoRoutingCode"
  // Return Address
  | "returnName"
  | "returnAddress1"
  | "returnAddress2"
  | "returnCity"
  | "returnPhone"
  | "customerCare"
  | "customerEmail"
  // Order Information
  | "orderNumber"
  | "invoiceNumber"
  | "invoiceDate"
  | "orderDate"
  | "gstin"
  // Items Table Columns
  | "itemColumn"
  | "skuColumn"
  | "qtyColumn"
  | "priceColumn"
  | "hsnColumn"
  | "taxableValueColumn"
  | "totalColumn"
  // Charges
  | "platformFee"
  | "shippingCharges"
  | "discount"
  | "collectableAmount";

export type LabelFieldState = {
  isVisible: boolean;
  fontSize: number; // px
  x: number; // position x in pixels
  y: number; // position y in pixels
};

export type LabelEditorState = Record<LabelFieldKey, LabelFieldState> & {
  sectionOrder: SectionKey[];
  sectionHeights: Record<SectionKey, number>;
};

// Section definitions
export type SectionKey = "A" | "B" | "C" | "D" | "E" | "F";

// Group definitions for draggable sections
export type LabelGroupKey = 
  | "brandingGroup"
  | "shipToAddressGroup"
  | "returnAddressGroup"
  | "orderInfoGroup"
  | "chargesGroup";

export type LabelData = {
  // Branding
  customerLogoUrl?: string;
  partnerLogoUrl?: string;
  // Shipping Information
  shipTo: string;
  shipToName: string;
  shipToAddress1: string;
  shipToAddress2: string;
  shipToCity: string;
  shipToPhone: string;
  shipperName: string;
  awbNumber: string;
  dimensions: string;
  paymentMethod: string;
  orderTotal: string;
  weight: string;
  ewaybillNumber: string;
  routingCode: string;
  rtoRoutingCode: string;
  // Return Address
  returnName: string;
  returnAddress1: string;
  returnAddress2: string;
  returnCity: string;
  returnPhone: string;
  customerCare: string;
  customerEmail: string;
  // Order Information
  orderNumber: string;
  invoiceNumber: string;
  invoiceDate: string;
  orderDate: string;
  gstin: string;
  // Items
  items: Array<{
    item: string;
    sku: string;
    qty: number;
    price: string;
    hsn: string;
    taxableValue: string;
    total: string;
  }>;
  // Charges
  platformFee: string;
  shippingCharges: string;
  discount: string;
  collectableAmount: string;
  // Legal
  legalDisclaimer?: string;
};
