"use client";

import { useReducer, useState } from "react";
import type { LabelData, LabelEditorState, LabelFieldKey, SectionKey } from "@/types/labels";
import { DEFAULT_EDITOR_STATE } from "@/configs/printables";
import { LabelControls } from "./label-controls";
import { LabelCanvas } from "./label-canvas";

function reducer(
  state: LabelEditorState,
  action:
    | {
        type: "toggle";
        field: LabelFieldKey;
        isVisible: boolean;
      }
    | {
        type: "font";
        field: LabelFieldKey;
        size: number;
      }
    | {
        type: "position";
        field: LabelFieldKey;
        x: number;
        y: number;
      }
    | {
        type: "reorderSections";
        sectionOrder: SectionKey[];
      }
    | {
        type: "resizeSection";
        sectionKey: SectionKey;
        height: number;
      },
): LabelEditorState {
  switch (action.type) {
    case "toggle":
      return { ...state, [action.field]: { ...state[action.field], isVisible: action.isVisible } };
    case "font":
      return { ...state, [action.field]: { ...state[action.field], fontSize: action.size } };
    case "position":
      return { ...state, [action.field]: { ...state[action.field], x: action.x, y: action.y } };
    case "reorderSections":
      return { 
        ...state, 
        sectionOrder: action.sectionOrder 
      };
    case "resizeSection":
      return {
        ...state,
        sectionHeights: { ...state.sectionHeights, [action.sectionKey]: action.height }
      };
    default:
      return state;
  }
}

export type LabelEditorProps = {
  data?: LabelData;
};

const SAMPLE_DATA: LabelData = {
  // Shipping Information
  shipTo: "Ship To",
  shipToName: "John Wick",
  shipToAddress1: "1234, Continental Boulevard phase 1",
  shipToAddress2: "Continental Boulevard phase 2 , 2nd floor",
  shipToCity: "Delhi,Delhi, India 10001",
  shipToPhone: "6969696969",
  shipperName: "VAMASHIP",
  awbNumber: "AWB: SR1234567890",
  dimensions: "Dimensions: 10x10x10",
  paymentMethod: "Payment: COD",
  orderTotal: "Order Total: ₹1000",
  weight: "Weight: 1.5 kg",
  ewaybillNumber: "EWaybill No: 1234567890",
  routingCode: "Routing code: DEL/UKH",
  rtoRoutingCode: "RTO Routing code: DEL/UEY",
  // Return Address
  returnName: "Aman Singh",
  returnAddress1: "1234, Continental Boulevard phase 1",
  returnAddress2: "Continental Boulevard phase 2 , 2nd floor",
  returnCity: "Delhi, Delhi 10001",
  returnPhone: "6969696969",
  customerCare: "Customer Care: 1800-123-4567",
  customerEmail: "Customer Email: vamaship@.com",
  // Order Information
  orderNumber: "Order#: #V1234",
  invoiceNumber: "Invoice No. Retail16366",
  invoiceDate: "Invoice Date: 2025/01/03",
  orderDate: "Order Date: 2025/01/01",
  gstin: "GSTIN: 7016152018",
  // Items
  items: [
    {
      item: "T-Shirt",
      sku: "SKU1",
      qty: 1,
      price: "₹1900.00",
      hsn: "HSN1",
      taxableValue: "₹100.00",
      total: "₹2000.00",
    },
    {
      item: "T-Shirt",
      sku: "SKU1",
      qty: 1,
      price: "₹1900.00",
      hsn: "HSN1",
      taxableValue: "₹100.00",
      total: "₹2000.00",
    },
    {
      item: "T-Shirt",
      sku: "SKU1",
      qty: 1,
      price: "₹1900.00",
      hsn: "HSN1",
      taxableValue: "₹100.00",
      total: "₹2000.00",
    },
    {
      item: "T-Shirt",
      sku: "SKU1",
      qty: 1,
      price: "₹1900.00",
      hsn: "HSN1",
      taxableValue: "₹100.00",
      total: "₹2000.00",
    },
    {
      item: "T-Shirt",
      sku: "SKU1",
      qty: 1,
      price: "₹1900.00",
      hsn: "HSN1",
      taxableValue: "₹100.00",
      total: "₹2000.00",
    },
  ],
  // Charges
  platformFee: "Platform Fee: ₹10",
  shippingCharges: "Shipping Charges: ₹0",
  discount: "Discount: ₹10",
  collectableAmount: "Collectable Amount: ₹2000.6",
  // Legal
  legalDisclaimer: "For claims or disputes, contact customer support within 30 days of delivery. Vamaship and its partners are not liable for delays due to circumstances beyond our control.",
};

export function LabelEditor({ data = SAMPLE_DATA }: LabelEditorProps) {
  const [state, dispatch] = useReducer(reducer, DEFAULT_EDITOR_STATE);
  const [labelData, setLabelData] = useState<LabelData>(data);

  const handleDataChange = (field: keyof LabelData, value: string) => {
    setLabelData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex h-full flex-col gap-3 lg:flex-row">
      {/* Left Side - Options/Controls (40% width) */}
      <div className="flex-shrink-0 lg:w-[43%]">
        <LabelControls
          state={state}
          data={labelData}
          onToggle={(field, isVisible) => dispatch({ type: "toggle", field, isVisible })}
          onFontSizeChange={(field, size) => dispatch({ type: "font", field, size })}
          onDataChange={handleDataChange}
        />
      </div>

      {/* Right Side - Canvas (60% width) */}
      <div className="lg:w-[50%]">
        <LabelCanvas
          data={labelData}
          state={state}
          onPositionChange={(field, x, y) => dispatch({ type: "position", field, x, y })}
          onFontSizeChange={(field, size) => dispatch({ type: "font", field, size })}
          onSectionReorder={(sectionOrder) => dispatch({ type: "reorderSections", sectionOrder })}
          onSectionResize={(sectionKey, height) => dispatch({ type: "resizeSection", sectionKey, height })}
        />
      </div>
    </div>
  );
}
