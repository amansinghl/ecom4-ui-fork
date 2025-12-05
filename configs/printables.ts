import type { LabelFieldKey, LabelEditorState, SectionKey, LabelGroupKey } from "@/types/labels";

export const SECTION_DEFAULTS = {
  A: { height: 150, label: "Ship To" },
  B: { height: 80, label: "Legal Text" },
  C: { height: 170, label: "Delivery Details" },
  D: { height: 200, label: "Items Table" },
  E: { height: 150, label: "Shipped By" },
  F: { height: 80, label: "Charges" },
};

export const LABEL_GROUPS: Record<LabelGroupKey, { label: string; fields: LabelFieldKey[] }> = {
  brandingGroup: {
    label: "Branding Section",
    fields: ["vamashipLogo", "customerLogo", "paymentMethod"],
  },
  shipToAddressGroup: {
    label: "Ship To Address",
    fields: ["shipTo", "shipToName", "shipToAddress1", "shipToAddress2", "shipToCity", "shipToPhone"],
  },
  returnAddressGroup: {
    label: "Return Address",
    fields: ["returnName", "returnAddress1", "returnAddress2", "returnCity", "returnPhone"],
  },
  orderInfoGroup: {
    label: "Order Information",
    fields: ["orderNumber", "invoiceNumber", "invoiceDate", "orderDate", "gstin"],
  },
  chargesGroup: {
    label: "Charges Summary",
    fields: ["platformFee", "shippingCharges", "discount"],
  },
};

export const FIELD_SECTIONS = [
  {
    title: "Branding",
    fields: [
      { key: "vamashipLogo" as LabelFieldKey, label: "Vamaship Logo" },
      { key: "customerLogo" as LabelFieldKey, label: "Customer Logo" },
      { key: "partnerLogo" as LabelFieldKey, label: "Partner Logo" },
      { key: "legalDisclaimer" as LabelFieldKey, label: "Legal Disclaimer" },
    ],
  },
  {
    title: "Shipping Information",
    fields: [
      { key: "shipTo" as LabelFieldKey, label: "Ship To" },
      { key: "shipToName" as LabelFieldKey, label: "Recipient Name" },
      { key: "shipToAddress1" as LabelFieldKey, label: "Address Line 1" },
      { key: "shipToAddress2" as LabelFieldKey, label: "Address Line 2" },
      { key: "shipToCity" as LabelFieldKey, label: "City" },
      { key: "shipToPhone" as LabelFieldKey, label: "Phone" },
      { key: "shipperName" as LabelFieldKey, label: "Shipper Name" },
      { key: "awbNumber" as LabelFieldKey, label: "AWB Number" },
      { key: "dimensions" as LabelFieldKey, label: "Dimensions" },
      { key: "paymentMethod" as LabelFieldKey, label: "Payment Method" },
      { key: "orderTotal" as LabelFieldKey, label: "Order Total" },
      { key: "weight" as LabelFieldKey, label: "Weight" },
      { key: "ewaybillNumber" as LabelFieldKey, label: "EWaybill Number" },
      { key: "routingCode" as LabelFieldKey, label: "Routing Code" },
      { key: "rtoRoutingCode" as LabelFieldKey, label: "RTO Routing Code" },
    ],
  },
  {
    title: "Return Address",
    fields: [
      { key: "returnName" as LabelFieldKey, label: "Return Name" },
      { key: "returnAddress1" as LabelFieldKey, label: "Return Address 1" },
      { key: "returnAddress2" as LabelFieldKey, label: "Return Address 2" },
      { key: "returnCity" as LabelFieldKey, label: "Return City" },
      { key: "returnPhone" as LabelFieldKey, label: "Return Phone" },
      { key: "customerCare" as LabelFieldKey, label: "Customer Care" },
      { key: "customerEmail" as LabelFieldKey, label: "Customer Email" },
    ],
  },
  {
    title: "Order Information",
    fields: [
      { key: "orderNumber" as LabelFieldKey, label: "Order Number" },
      { key: "invoiceNumber" as LabelFieldKey, label: "Invoice Number" },
      { key: "invoiceDate" as LabelFieldKey, label: "Invoice Date" },
      { key: "orderDate" as LabelFieldKey, label: "Order Date" },
      { key: "gstin" as LabelFieldKey, label: "GSTIN" },
    ],
  },
  {
    title: "Items & Charges",
    fields: [
      { key: "itemColumn" as LabelFieldKey, label: "Item Column" },
      { key: "skuColumn" as LabelFieldKey, label: "SKU Column" },
      { key: "qtyColumn" as LabelFieldKey, label: "Qty Column" },
      { key: "priceColumn" as LabelFieldKey, label: "Price Column" },
      { key: "hsnColumn" as LabelFieldKey, label: "HSN Column" },
      { key: "taxableValueColumn" as LabelFieldKey, label: "Taxable Value Column" },
      { key: "totalColumn" as LabelFieldKey, label: "Total Column" },
      { key: "platformFee" as LabelFieldKey, label: "Platform Fee" },
      { key: "shippingCharges" as LabelFieldKey, label: "Shipping Charges" },
      { key: "discount" as LabelFieldKey, label: "Discount" },
      { key: "collectableAmount" as LabelFieldKey, label: "Collectable Amount" },
    ],
  },
] as const;

export const DEFAULT_EDITOR_STATE: LabelEditorState = {
  sectionOrder: ["A", "E", "C", "D", "F", "B"],
  sectionHeights: {
    A: 150, // Ship To + Customer Logo
    B: 100, // Legal Text + Partner Logo
    C: 160, // Delivery Details + Barcode
    D: 160, // Items Table
    E: 180, // Shipped By (left) + Order Information (right)
    F: 70, // Charges
  },
  // Branding (positions relative to sections)
  vamashipLogo: { isVisible: true, fontSize: 10, x: 60, y: 60 },
  customerLogo: { isVisible: false, fontSize: 12, x: 600, y: 50 },
  partnerLogo: { isVisible: true, fontSize: 12, x: 50, y: 950 },
  legalDisclaimer: { isVisible: true, fontSize: 12, x: 200, y: 950 },
  shipperName: { isVisible: false, fontSize: 12, x: 50, y: 80 },
  paymentMethod: { isVisible: true, fontSize: 12, x: 50, y: 110 },
  
  // AWB Barcode (below branding)
  awbNumber: { isVisible: true, fontSize: 12, x: 50, y: 160 },
  
  // Shipping Information (Ship To)
  shipTo: { isVisible: true, fontSize: 14, x: 50, y: 240 },
  shipToName: { isVisible: true, fontSize: 12, x: 50, y: 260 },
  shipToAddress1: { isVisible: true, fontSize: 12, x: 50, y: 285 },
  shipToAddress2: { isVisible: true, fontSize: 12, x: 50, y: 305 },
  shipToCity: { isVisible: true, fontSize: 12, x: 50, y: 325 },
  shipToPhone: { isVisible: true, fontSize: 12, x: 400, y: 325 },
  
  // Dimensions/Weight & Collectable
  dimensions: { isVisible: true, fontSize: 12, x: 50, y: 360 },
  weight: { isVisible: true, fontSize: 12, x: 50, y: 380 },
  collectableAmount: { isVisible: true, fontSize: 12, x: 450, y: 360 },
  
  // Routing codes
  ewaybillNumber: { isVisible: true, fontSize: 12, x: 50, y: 420 },
  routingCode: { isVisible: true, fontSize: 12, x: 400, y: 420 },
  rtoRoutingCode: { isVisible: true, fontSize: 12, x: 550, y: 420 },
  
  // Order Information
  orderNumber: { isVisible: true, fontSize: 12, x: 50, y: 480 },
  invoiceNumber: { isVisible: true, fontSize: 12, x: 400, y: 480 },
  invoiceDate: { isVisible: true, fontSize: 12, x: 50, y: 505 },
  orderDate: { isVisible: true, fontSize: 12, x: 400, y: 505 },
  gstin: { isVisible: true, fontSize: 12, x: 50, y: 530 },
  
  // Items Table Columns
  itemColumn: { isVisible: true, fontSize: 12, x: 50, y: 570 },
  skuColumn: { isVisible: true, fontSize: 12, x: 50, y: 570 },
  qtyColumn: { isVisible: true, fontSize: 12, x: 50, y: 570 },
  priceColumn: { isVisible: true, fontSize: 12, x: 50, y: 570 },
  hsnColumn: { isVisible: true, fontSize: 12, x: 50, y: 570 },
  taxableValueColumn: { isVisible: true, fontSize: 12, x: 50, y: 570 },
  totalColumn: { isVisible: true, fontSize: 12, x: 50, y: 570 },
  
  // Charges Summary
  platformFee: { isVisible: true, fontSize: 12, x: 50, y: 720 },
  shippingCharges: { isVisible: true, fontSize: 12, x: 400, y: 720 },
  discount: { isVisible: true, fontSize: 12, x: 50, y: 745 },
  
  // Misc
  orderTotal: { isVisible: true, fontSize: 12, x: 50, y: 400 },
  
  // Return Address
  returnName: { isVisible: true, fontSize: 12, x: 50, y: 800 },
  returnAddress1: { isVisible: true, fontSize: 12, x: 50, y: 825 },
  returnAddress2: { isVisible: true, fontSize: 12, x: 50, y: 845 },
  returnCity: { isVisible: true, fontSize: 12, x: 50, y: 865 },
  returnPhone: { isVisible: true, fontSize: 12, x: 50, y: 885 },
  customerCare: { isVisible: true, fontSize: 12, x: 50, y: 910 },
  customerEmail: { isVisible: true, fontSize: 12, x: 50, y: 930 },
};

