"use client";

import type { LabelData, LabelEditorState, LabelFieldKey } from "@/types/labels";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

type LabelPreviewProps = {
  data: LabelData;
  state: LabelEditorState;
  onFontSizeChange: (field: LabelFieldKey, size: number) => void;
};

export function LabelPreview({ data, state, onFontSizeChange }: LabelPreviewProps) {
  return (
    <Card className="h-full w-full">
      <CardHeader className="">
        <CardTitle className="text-lg font-semibold">Label Preview</CardTitle>
        <p className="text-muted-foreground text-sm">Click the settings icon on any field to adjust font size</p>
      </CardHeader>
      {/* <Separator /> */}
      <CardContent className="flex items-center justify-center pt-2">
        <div className="min-h-[1123px] w-[794px] bg-white p-6 text-black">
          <div className="mx-auto min-h-[960px] max-w-[680px] border-2 border-black p-4 font-mono text-sm leading-relaxed">
            {/* Header: Branding + QR */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col">
                {state.vamashipLogo?.isVisible && (
                  <EditableField
                    fieldKey="vamashipLogo"
                    fontSize={state.vamashipLogo.fontSize}
                    onFontSizeChange={onFontSizeChange}
                  >
                    <div
                      className="font-extrabold tracking-wide"
                      style={{ fontSize: Math.max(16, state.vamashipLogo.fontSize + 2), color: "#1e3a8a" }}
                    >
                      VAMASHIP
                    </div>
                  </EditableField>
                )}
                {state.shipperName.isVisible && (
                  <EditableField
                    fieldKey="shipperName"
                    fontSize={state.shipperName.fontSize}
                    onFontSizeChange={onFontSizeChange}
                  >
                    <div className="font-bold" style={{ fontSize: Math.max(12, state.shipperName.fontSize) }}>
                      {data.shipperName}
                    </div>
                  </EditableField>
                )}
                {state.paymentMethod.isVisible && (
                  <EditableField
                    fieldKey="paymentMethod"
                    fontSize={state.paymentMethod.fontSize}
                    onFontSizeChange={onFontSizeChange}
                  >
                    <div
                      className="mt-2 inline-flex items-center border px-2 py-1 text-xs font-bold"
                      style={{ fontSize: state.paymentMethod.fontSize }}
                    >
                      {data.paymentMethod.toUpperCase()}
                    </div>
                  </EditableField>
                )}
              </div>
              <div className="flex items-center gap-2">
                {state.customerLogo?.isVisible && (
                  <EditableField
                    fieldKey="customerLogo"
                    fontSize={state.customerLogo.fontSize}
                    onFontSizeChange={onFontSizeChange}
                  >
                    {data.customerLogoUrl ? (
                      <img
                        src={data.customerLogoUrl}
                        alt="Customer Logo"
                        className="h-16 w-16 border border-black object-contain"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center border border-black">
                        <span className="text-[10px]">Customer Logo</span>
                      </div>
                    )}
                  </EditableField>
                )}
                <QRPlaceholder />
              </div>
            </div>

            <div className="my-2 border-t border-dashed border-gray-500" />

            {/* AWB Barcode */}
            {state.awbNumber.isVisible && (
              <EditableField
                fieldKey="awbNumber"
                fontSize={state.awbNumber.fontSize}
                onFontSizeChange={onFontSizeChange}
              >
                <div className="w-full rounded border p-2">
                  <div className="w-full">{renderBarcodeSvg(data.awbNumber.replace(/[^A-Za-z0-9]/g, ""))}</div>
                  <div
                    className="mt-1 text-center font-semibold tracking-widest"
                    style={{ fontSize: state.awbNumber.fontSize }}
                  >
                    {data.awbNumber}
                  </div>
                </div>
              </EditableField>
            )}

            {/* Ship To */}
            <div className="mt-3">
              {state.shipTo.isVisible && (
                <EditableField fieldKey="shipTo" fontSize={state.shipTo.fontSize} onFontSizeChange={onFontSizeChange}>
                  <div className="text-[10px] tracking-widest text-gray-700">{data.shipTo}</div>
                </EditableField>
              )}
              {state.shipToName.isVisible && (
                <EditableField
                  fieldKey="shipToName"
                  fontSize={state.shipToName.fontSize}
                  onFontSizeChange={onFontSizeChange}
                >
                  <div className="font-extrabold" style={{ fontSize: Math.max(14, state.shipToName.fontSize + 2) }}>
                    {data.shipToName}
                  </div>
                </EditableField>
              )}
              {state.shipToAddress1.isVisible && (
                <EditableField
                  fieldKey="shipToAddress1"
                  fontSize={state.shipToAddress1.fontSize}
                  onFontSizeChange={onFontSizeChange}
                >
                  <div style={{ fontSize: state.shipToAddress1.fontSize }}>{data.shipToAddress1}</div>
                </EditableField>
              )}
              {state.shipToAddress2.isVisible && (
                <EditableField
                  fieldKey="shipToAddress2"
                  fontSize={state.shipToAddress2.fontSize}
                  onFontSizeChange={onFontSizeChange}
                >
                  <div style={{ fontSize: state.shipToAddress2.fontSize }}>{data.shipToAddress2}</div>
                </EditableField>
              )}
              <div className="flex items-center justify-between gap-2">
                {state.shipToCity.isVisible && (
                  <EditableField
                    fieldKey="shipToCity"
                    fontSize={state.shipToCity.fontSize}
                    onFontSizeChange={onFontSizeChange}
                  >
                    <div className="font-semibold" style={{ fontSize: state.shipToCity.fontSize }}>
                      {data.shipToCity}
                    </div>
                  </EditableField>
                )}
                {state.shipToPhone.isVisible && (
                  <EditableField
                    fieldKey="shipToPhone"
                    fontSize={state.shipToPhone.fontSize}
                    onFontSizeChange={onFontSizeChange}
                  >
                    <div className="font-semibold" style={{ fontSize: state.shipToPhone.fontSize }}>
                      {data.shipToPhone}
                    </div>
                  </EditableField>
                )}
              </div>
            </div>

            {/* Dimensions/Weight & Collectable */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="space-y-1">
                {state.dimensions.isVisible && (
                  <EditableField
                    fieldKey="dimensions"
                    fontSize={state.dimensions.fontSize}
                    onFontSizeChange={onFontSizeChange}
                  >
                    <div style={{ fontSize: state.dimensions.fontSize }}>{data.dimensions}</div>
                  </EditableField>
                )}
                {state.weight.isVisible && (
                  <EditableField fieldKey="weight" fontSize={state.weight.fontSize} onFontSizeChange={onFontSizeChange}>
                    <div style={{ fontSize: state.weight.fontSize }}>{data.weight}</div>
                  </EditableField>
                )}
              </div>
              <div className="flex flex-col items-end">
                {state.collectableAmount.isVisible && (
                  <EditableField
                    fieldKey="collectableAmount"
                    fontSize={state.collectableAmount.fontSize}
                    onFontSizeChange={onFontSizeChange}
                  >
                    <div
                      className="w-full rounded border-2 px-2 py-1 text-center font-extrabold"
                      style={{ fontSize: Math.max(14, state.collectableAmount.fontSize) }}
                    >
                      {data.collectableAmount}
                    </div>
                  </EditableField>
                )}
              </div>
            </div>

            {/* Routing */}
            <div className="mt-2 grid grid-cols-2 gap-2">
              {state.ewaybillNumber.isVisible && (
                <EditableField
                  fieldKey="ewaybillNumber"
                  fontSize={state.ewaybillNumber.fontSize}
                  onFontSizeChange={onFontSizeChange}
                >
                  <div className="text-xs" style={{ fontSize: state.ewaybillNumber.fontSize }}>
                    {data.ewaybillNumber}
                  </div>
                </EditableField>
              )}
              <div className="flex items-center justify-end gap-2">
                {state.routingCode.isVisible && (
                  <EditableField
                    fieldKey="routingCode"
                    fontSize={state.routingCode.fontSize}
                    onFontSizeChange={onFontSizeChange}
                  >
                    <div className="text-xs" style={{ fontSize: state.routingCode.fontSize }}>
                      {data.routingCode}
                    </div>
                  </EditableField>
                )}
                {state.rtoRoutingCode.isVisible && (
                  <EditableField
                    fieldKey="rtoRoutingCode"
                    fontSize={state.rtoRoutingCode.fontSize}
                    onFontSizeChange={onFontSizeChange}
                  >
                    <div className="text-xs" style={{ fontSize: state.rtoRoutingCode.fontSize }}>
                      {data.rtoRoutingCode}
                    </div>
                  </EditableField>
                )}
              </div>
            </div>

            <div className="my-2 border-t border-dashed border-gray-500" />

            {/* Order Info */}
            <div className="grid grid-cols-2 gap-2">
              {state.orderNumber.isVisible && (
                <EditableField
                  fieldKey="orderNumber"
                  fontSize={state.orderNumber.fontSize}
                  onFontSizeChange={onFontSizeChange}
                >
                  <div style={{ fontSize: state.orderNumber.fontSize }}>{data.orderNumber}</div>
                </EditableField>
              )}
              {state.invoiceNumber.isVisible && (
                <EditableField
                  fieldKey="invoiceNumber"
                  fontSize={state.invoiceNumber.fontSize}
                  onFontSizeChange={onFontSizeChange}
                >
                  <div style={{ fontSize: state.invoiceNumber.fontSize }}>{data.invoiceNumber}</div>
                </EditableField>
              )}
              {state.invoiceDate.isVisible && (
                <EditableField
                  fieldKey="invoiceDate"
                  fontSize={state.invoiceDate.fontSize}
                  onFontSizeChange={onFontSizeChange}
                >
                  <div style={{ fontSize: state.invoiceDate.fontSize }}>{data.invoiceDate}</div>
                </EditableField>
              )}
              {state.orderDate.isVisible && (
                <EditableField
                  fieldKey="orderDate"
                  fontSize={state.orderDate.fontSize}
                  onFontSizeChange={onFontSizeChange}
                >
                  <div style={{ fontSize: state.orderDate.fontSize }}>{data.orderDate}</div>
                </EditableField>
              )}
            </div>

            {state.gstin.isVisible && (
              <EditableField fieldKey="gstin" fontSize={state.gstin.fontSize} onFontSizeChange={onFontSizeChange}>
                <div className="mt-1" style={{ fontSize: state.gstin.fontSize }}>
                  {data.gstin}
                </div>
              </EditableField>
            )}

            {/* Items Table (compact) */}
            {state.itemsTable.isVisible && (
              <EditableField
                fieldKey="itemsTable"
                fontSize={state.itemsTable.fontSize}
                onFontSizeChange={onFontSizeChange}
              >
                <div className="my-2">
                  <div
                    className="mb-1 grid grid-cols-7 gap-1 border-b border-black pb-1 text-center font-bold"
                    style={{ fontSize: state.itemsTable.fontSize }}
                  >
                    <div>Item</div>
                    <div>SKU</div>
                    <div>Qty</div>
                    <div>Price</div>
                    <div>HSN</div>
                    <div>Taxable</div>
                    <div>Total</div>
                  </div>
                  {data.items.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-7 gap-1 border-b border-gray-300 py-1 text-center"
                      style={{ fontSize: state.itemsTable.fontSize }}
                    >
                      <div className="truncate font-medium">{item.item}</div>
                      <div className="truncate">{item.sku}</div>
                      <div>{item.qty}</div>
                      <div className="font-semibold">{item.price}</div>
                      <div className="truncate">{item.hsn}</div>
                      <div className="truncate">{item.taxableValue}</div>
                      <div className="font-bold">{item.total}</div>
                    </div>
                  ))}
                </div>
              </EditableField>
            )}

            {/* Charges summary */}
            <div className="my-2 rounded border p-2">
              <div className="grid grid-cols-2 gap-2">
                {state.platformFee.isVisible && (
                  <EditableField
                    fieldKey="platformFee"
                    fontSize={state.platformFee.fontSize}
                    onFontSizeChange={onFontSizeChange}
                  >
                    <div className="font-semibold" style={{ fontSize: state.platformFee.fontSize }}>
                      {data.platformFee}
                    </div>
                  </EditableField>
                )}
                {state.shippingCharges.isVisible && (
                  <EditableField
                    fieldKey="shippingCharges"
                    fontSize={state.shippingCharges.fontSize}
                    onFontSizeChange={onFontSizeChange}
                  >
                    <div className="font-semibold" style={{ fontSize: state.shippingCharges.fontSize }}>
                      {data.shippingCharges}
                    </div>
                  </EditableField>
                )}
                {state.discount.isVisible && (
                  <EditableField
                    fieldKey="discount"
                    fontSize={state.discount.fontSize}
                    onFontSizeChange={onFontSizeChange}
                  >
                    <div className="font-semibold" style={{ fontSize: state.discount.fontSize }}>
                      {data.discount}
                    </div>
                  </EditableField>
                )}
              </div>
            </div>

            <div className="my-2 border-t border-dashed border-gray-500" />

            {/* Return + Legal */}
            <div className="mt-1">
              {state.returnName.isVisible && (
                <EditableField
                  fieldKey="returnName"
                  fontSize={state.returnName.fontSize}
                  onFontSizeChange={onFontSizeChange}
                >
                  <div className="text-[10px] tracking-widest text-gray-700">
                    Shipped By (if undelivered, return to)
                  </div>
                  <div className="font-semibold" style={{ fontSize: state.returnName.fontSize }}>
                    {data.returnName}
                  </div>
                </EditableField>
              )}
              {state.returnAddress1.isVisible && (
                <EditableField
                  fieldKey="returnAddress1"
                  fontSize={state.returnAddress1.fontSize}
                  onFontSizeChange={onFontSizeChange}
                >
                  <div style={{ fontSize: state.returnAddress1.fontSize }}>{data.returnAddress1}</div>
                </EditableField>
              )}
              {state.returnAddress2.isVisible && (
                <EditableField
                  fieldKey="returnAddress2"
                  fontSize={state.returnAddress2.fontSize}
                  onFontSizeChange={onFontSizeChange}
                >
                  <div style={{ fontSize: state.returnAddress2.fontSize }}>{data.returnAddress2}</div>
                </EditableField>
              )}
              {state.returnCity.isVisible && (
                <EditableField
                  fieldKey="returnCity"
                  fontSize={state.returnCity.fontSize}
                  onFontSizeChange={onFontSizeChange}
                >
                  <div style={{ fontSize: state.returnCity.fontSize }}>{data.returnCity}</div>
                </EditableField>
              )}
              {state.returnPhone.isVisible && (
                <EditableField
                  fieldKey="returnPhone"
                  fontSize={state.returnPhone.fontSize}
                  onFontSizeChange={onFontSizeChange}
                >
                  <div className="font-semibold" style={{ fontSize: state.returnPhone.fontSize }}>
                    {data.returnPhone}
                  </div>
                </EditableField>
              )}
            </div>

            <div className="my-2 rounded border p-2">
              {state.legalText.isVisible && (
                <EditableField
                  fieldKey="legalText"
                  fontSize={state.legalText.fontSize}
                  onFontSizeChange={onFontSizeChange}
                >
                  <div className="text-center text-gray-700 italic" style={{ fontSize: state.legalText.fontSize }}>
                    {data.legalText}
                  </div>
                </EditableField>
              )}
              {state.signatureText.isVisible && (
                <EditableField
                  fieldKey="signatureText"
                  fontSize={state.signatureText.fontSize}
                  onFontSizeChange={onFontSizeChange}
                >
                  <div
                    className="mt-2 border-t border-gray-300 pt-2 text-center font-semibold text-gray-800"
                    style={{ fontSize: state.signatureText.fontSize }}
                  >
                    {data.signatureText}
                  </div>
                </EditableField>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Section({
  title,
  fieldKey,
  fontSize,
  onFontSizeChange,
  children,
}: {
  title: string;
  fieldKey: LabelFieldKey;
  fontSize: number;
  onFontSizeChange: (field: LabelFieldKey, size: number) => void;
  children: React.ReactNode;
}) {
  return (
    <EditableField fieldKey={fieldKey} fontSize={fontSize} onFontSizeChange={onFontSizeChange}>
      <div className="mb-1 text-[10px] tracking-widest text-gray-700">{title}</div>
      {children}
    </EditableField>
  );
}

function AddressBlock({
  name,
  line1,
  city,
  state,
  zip,
  fontSize,
}: {
  name: string;
  line1: string;
  city: string;
  state: string;
  zip: string;
  fontSize: number;
}) {
  return (
    <div className="text-sm leading-tight" style={{ fontSize }}>
      <div className="font-bold">{name}</div>
      <div>{line1}</div>
      <div>
        {city}, {state} {zip}
      </div>
    </div>
  );
}

function EditableField({
  fieldKey,
  fontSize,
  onFontSizeChange,
  children,
}: {
  fieldKey: LabelFieldKey;
  fontSize: number;
  onFontSizeChange: (field: LabelFieldKey, size: number) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative">
      {children}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "absolute -top-2 -right-2 h-7 w-7 rounded-full opacity-0 transition-opacity",
              "group-hover:opacity-100",
            )}
            aria-label={`Edit ${fieldKey} font size`}
          >
            <Settings2 className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="end">
          <div className="space-y-3">
            <div className="text-sm font-medium capitalize">{fieldKey} size</div>
            <Slider
              value={[fontSize]}
              min={10}
              max={24}
              step={1}
              onValueChange={([v]) => onFontSizeChange(fieldKey, v)}
            />
            <div className="text-muted-foreground text-xs">{fontSize}px</div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function QRPlaceholder() {
  return (
    <div
      className="h-16 w-16 rounded-sm border-2 border-black"
      aria-hidden
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, #000 0, #000 1px, transparent 1px, transparent 4px), repeating-linear-gradient(90deg, #000 0, #000 1px, transparent 1px, transparent 4px)",
        backgroundSize: "6px 6px, 6px 6px",
        backgroundPosition: "0 0, 0 0",
      }}
    />
  );
}

function renderBarcodeSvg(code: string) {
  const sanitized = code || "";
  const bars = [] as Array<{ x: number; w: number }>;
  let x = 0;
  for (let i = 0; i < sanitized.length; i++) {
    const v = sanitized.charCodeAt(i);
    // Produce 7 bars per char with varying widths (1-3)
    for (let b = 0; b < 7; b++) {
      const bit = (v >> b) & 1;
      const width = 1 + ((v >> (b + (i % 3))) % 3);
      if (bit === 1) {
        bars.push({ x, w: width });
      }
      x += width;
    }
    // Gap between characters
    x += 2;
  }
  const totalWidth = Math.max(200, x + 4);
  const height = 64;
  return (
    <svg viewBox={`0 0 ${totalWidth} ${height}`} className="h-16 w-full" role="img" aria-label="AWB Barcode">
      <rect x="0" y="0" width={totalWidth} height={height} fill="#fff" />
      {bars.map((bar, idx) => (
        <rect key={idx} x={bar.x} y={4} width={bar.w} height={height - 8} fill="#000" />
      ))}
    </svg>
  );
}
