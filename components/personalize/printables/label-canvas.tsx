"use client";

import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import type { LabelData, LabelEditorState, LabelFieldKey, SectionKey } from "@/types/labels";
import { SECTION_DEFAULTS } from "@/configs/printables";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, GripVertical, FileJson } from "lucide-react";

type LabelCanvasProps = {
  data: LabelData;
  state: LabelEditorState;
  onPositionChange: (field: LabelFieldKey, x: number, y: number) => void;
  onFontSizeChange: (field: LabelFieldKey, size: number) => void;
  onSectionReorder: (sectionOrder: SectionKey[]) => void;
  onSectionResize: (sectionKey: SectionKey, height: number) => void;
};

// Canvas dimensions - 4x6 inch label at 100 DPI
const CANVAS_WIDTH = 614;
const CANVAS_HEIGHT = 864;
const BORDER_STRIP_WIDTH = 15; // Width of decorative border strip

export function LabelCanvas({ data, state, onSectionReorder, onSectionResize }: LabelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  // Initialize fabric canvas
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: "#ffffff",
      selection: false,
    });

    fabricCanvasRef.current = canvas;
    setIsCanvasReady(true);

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, []);

  // Render sections when ready or state changes
  useEffect(() => {
    if (!fabricCanvasRef.current || !isCanvasReady) return;
    renderAllSections();
  }, [isCanvasReady, state, data]);

  // Handle section dragging and hover effects
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: any) => {
      const target = e.target;
      if (!target || !target.data || target.data.type !== "section") return;

      // Bring section to front so all borders are visible while dragging
      canvas.bringObjectToFront(target);

      // Store original background for later restoration
      if (!target.originalBackground) {
        const bgRect = target.getObjects().find((obj: any) => obj instanceof fabric.Rect);
        if (bgRect) {
          target.originalBackground = bgRect.fill;
        }
      }

      // Find the background rect and modify it
      const bgRect = target.getObjects().find((obj: any) => obj instanceof fabric.Rect);
      if (bgRect) {
        // Highlight with a light blue background when dragging starts
        bgRect.set({ 
          fill: "#dbeafe", // Light blue highlight
          stroke: "#3b82f6", // Brighter blue
          strokeWidth: 3,
          strokeDashArray: null, // Remove dashes during drag
        });
      }

      canvas.renderAll();
    };

    const handleMouseUp = (e: any) => {
      const target = e.target;
      if (!target || !target.data || target.data.type !== "section") return;

      // Find the background rect and restore it
      const bgRect = target.getObjects().find((obj: any) => obj instanceof fabric.Rect);
      if (bgRect) {
        // Restore original background
        if (target.originalBackground) {
          bgRect.set({ fill: target.originalBackground });
        }
        // Reset border to normal state
        bgRect.set({
          stroke: "#000000",
          strokeWidth: 1.5,
          strokeDashArray: null,
        });
      }

      canvas.renderAll();
    };

    const handleObjectMoving = (e: any) => {
      const target = e.target;
      if (!target || !target.data || target.data.type !== "section") return;

      // Lock horizontal movement
      target.left = BORDER_STRIP_WIDTH + 5;
      target.setCoords();
    };

    const handleObjectModified = (e: any) => {
      const target = e.target;
      if (!target || !target.data || target.data.type !== "section") return;

      // Find the background rect and restore it
      const bgRect = target.getObjects().find((obj: any) => obj instanceof fabric.Rect);
      if (bgRect) {
        // Restore original background
        if (target.originalBackground) {
          bgRect.set({ fill: target.originalBackground });
        }
        // Reset border
        bgRect.set({
          stroke: "#000000",
          strokeWidth: 1.5,
          strokeDashArray: null,
        });
      }

      // Restore proper z-order based on Y position
      const sections = canvas.getObjects().filter((obj: any) => obj.data?.type === "section");
      const sortedSections = sections.sort((a, b) => (a.top || 0) - (b.top || 0));
      sortedSections.forEach((section) => {
        canvas.bringObjectToFront(section);
      });

      canvas.renderAll();

      // Reorder sections based on Y position
      reorderSectionsBasedOnPosition();
    };

    const handleMouseOver = (e: any) => {
      const target = e.target;
      if (!target || !target.data || target.data.type !== "section") return;

      // Don't override if currently dragging
      if (target.isMoving) return;

      // Bring section to front so all borders are visible
      canvas.bringObjectToFront(target);

      // Find the background rect and change border to dashed purple
      const bgRect = target.getObjects().find((obj: any) => obj instanceof fabric.Rect);
      if (bgRect) {
        bgRect.set({
          stroke: "#3b82f6", // Purple color
          strokeWidth: 3, // Bolder and bigger
          strokeDashArray: [8, 5], // Bigger dashes
        });
      }

      canvas.renderAll();
    };

    const handleMouseOut = (e: any) => {
      const target = e.target;
      if (!target || !target.data || target.data.type !== "section") return;

      // Don't override if currently dragging
      if (target.isMoving) return;

      // Find the background rect and reset border to solid black
      const bgRect = target.getObjects().find((obj: any) => obj instanceof fabric.Rect);
      if (bgRect) {
        bgRect.set({
          stroke: "#000000",
          strokeWidth: 1.5,
          strokeDashArray: null,
        });
      }

      canvas.renderAll();
    };

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:up", handleMouseUp);
    canvas.on("object:moving", handleObjectMoving);
    canvas.on("object:modified", handleObjectModified);
    canvas.on("mouse:over", handleMouseOver);
    canvas.on("mouse:out", handleMouseOut);

    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:up", handleMouseUp);
      canvas.off("object:moving", handleObjectMoving);
      canvas.off("object:modified", handleObjectModified);
      canvas.off("mouse:over", handleMouseOver);
      canvas.off("mouse:out", handleMouseOut);
    };
  }, [state.sectionOrder]);

  const reorderSectionsBasedOnPosition = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const sections = canvas.getObjects().filter((obj: any) => obj.data?.type === "section");
    const sortedSections = sections.sort((a, b) => (a.top || 0) - (b.top || 0));
    const newOrder = sortedSections.map((sec: any) => sec.data.sectionKey as SectionKey);

    if (JSON.stringify(newOrder) !== JSON.stringify(state.sectionOrder)) {
      onSectionReorder(newOrder);
    }
  };

  const renderAllSections = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Clear canvas
    canvas.clear();
    canvas.backgroundColor = "#ffffff";

    // Render decorative border strip with repeated "vamaship •" text
    renderDecorativeBorder(state);

    // Calculate content area (inside the decorative border)
    const contentStartY = BORDER_STRIP_WIDTH + 5;
    const contentWidth = CANVAS_WIDTH - 2 * BORDER_STRIP_WIDTH - 10;
    const contentX = BORDER_STRIP_WIDTH + 5;

    let currentY = contentStartY;

    state.sectionOrder.forEach((sectionKey) => {
      const height = state.sectionHeights[sectionKey];
      renderSection(sectionKey, contentX, currentY, contentWidth, height);
      currentY += height;
    });

    canvas.renderAll();
  };

  const renderDecorativeBorder = (editorState: LabelEditorState) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Outer border rectangle (canvas edge)
    const outerBorder = new fabric.Rect({
      left: 0,
      top: 0,
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      fill: "transparent",
      stroke: "#000000",
      strokeWidth: 2,
      selectable: false,
      evented: false,
    });
    (outerBorder as any).data = { type: 'border-rect', name: 'outer' };
    canvas.add(outerBorder);

    // Inner border removed - sections already have their own borders

    // Add repeated "vamaship" text around the border strips (controlled by vamashipLogo toggle)
    if (editorState.vamashipLogo?.isVisible !== false) {
      const borderText = "vamaship";
      const fontSize = editorState.vamashipLogo?.fontSize || 5;
      const textColor = "#2563eb"; // Blue color

      // Calculate text width for proper centering
      const tempText = new fabric.Text(borderText, {
        fontSize: fontSize,
        fontFamily: "Arial, sans-serif",
        fontWeight: "bold",
      });
      const textWidth = tempText.width || 40;
      const textHeight = tempText.height || 10;

      // Top border strip - 4 repetitions centered
      const topCount = 7;
      const topTotalWidth = topCount * textWidth;
      const topPadding = (CANVAS_WIDTH - topTotalWidth) / (topCount + 1);
      for (let i = 0; i < topCount; i++) {
        const text = new fabric.Text(borderText, {
          left: topPadding + i * (textWidth + topPadding),
          top: 3,
          fontSize: fontSize,
          fontFamily: "Arial, sans-serif",
          fontWeight: "bold",
          fill: textColor,
          selectable: false,
          evented: false,
        });
        (text as any).data = { type: 'border-strip', position: 'top' };
        canvas.add(text);
      }

      // Bottom border strip - 4 repetitions centered
      for (let i = 0; i < topCount; i++) {
        const text = new fabric.Text(borderText, {
          left: topPadding + i * (textWidth + topPadding),
          top: CANVAS_HEIGHT - BORDER_STRIP_WIDTH + 2,
          fontSize: fontSize,
          fontFamily: "Arial, sans-serif",
          fontWeight: "bold",
          fill: textColor,
          selectable: false,
          evented: false,
        });
        (text as any).data = { type: 'border-strip', position: 'bottom' };
        canvas.add(text);
      }

      // Left border strip - 6 repetitions centered vertically
      const sideCount = 12;
      const sideTotalHeight = sideCount * textWidth; // Using textWidth because text is rotated
      const sidePadding = (CANVAS_HEIGHT - sideTotalHeight) / (sideCount + 1);
      for (let i = 0; i < sideCount; i++) {
        const text = new fabric.Text(borderText, {
          left: BORDER_STRIP_WIDTH / 2,
          top: sidePadding + i * (textWidth + sidePadding) + textWidth / 2,
          fontSize: fontSize,
          fontFamily: "Arial, sans-serif",
          fontWeight: "bold",
          fill: textColor,
          angle: -90,
          originX: "center",
          originY: "center",
          selectable: false,
          evented: false,
        });
        (text as any).data = { type: 'border-strip', position: 'left' };
        canvas.add(text);
      }

      // Right border strip - 6 repetitions centered vertically
      for (let i = 0; i < sideCount; i++) {
        const text = new fabric.Text(borderText, {
          left: CANVAS_WIDTH - BORDER_STRIP_WIDTH / 2,
          top: sidePadding + i * (textWidth + sidePadding) + textWidth / 2,
          fontSize: fontSize,
          fontFamily: "Arial, sans-serif",
          fontWeight: "bold",
          fill: textColor,
          angle: 90,
          originX: "center",
          originY: "center",
          selectable: false,
          evented: false,
        });
        (text as any).data = { type: 'border-strip', position: 'right' };
        canvas.add(text);
      }
    } // End of vamashipLogo visibility check
  };

  const renderSection = (sectionKey: SectionKey, x: number, y: number, width: number, height: number) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Collect all objects for this section
    const sectionObjects: fabric.Object[] = [];

    // Section background
    const sectionBg = new fabric.Rect({
      left: 0,
      top: 0,
      width: width,
      height: height,
      fill: "#ffffff",
      stroke: "#000000",
      strokeWidth: 1.5,
      selectable: false,
      evented: false,
    });
    sectionObjects.push(sectionBg);

    // Get section content objects (with relative positioning)
    const contentObjects = getSectionContentObjects(sectionKey, width, height, state, data);
    sectionObjects.push(...contentObjects);

    // Create a group with all section objects
    const sectionGroup = new fabric.Group(sectionObjects, {
      left: x,
      top: y,
      selectable: true,
      hasControls: false,
      lockRotation: true,
      lockScalingX: true,
      lockScalingY: true,
      lockMovementX: true,
      hoverCursor: "move",
      moveCursor: "move",
      subTargetCheck: false, // Treat the whole group as one object
    });

    (sectionGroup as any).data = { type: "section", sectionKey };
    
    canvas.add(sectionGroup);
  };

  const getSectionContentObjects = (
    sectionKey: SectionKey,
    width: number,
    height: number,
    editorState: LabelEditorState,
    labelData: LabelData,
  ): fabric.Object[] => {
    const contentX = 8;
    const contentY = 18;
    const contentWidth = width - 16;

    switch (sectionKey) {
      case "A": // A1: Ship To (left) + A2: Customer Logo (right)
        return getSectionAObjects(contentX, contentY, contentWidth, height - 18, editorState, labelData);
      case "B": // Legal Text + Partner Logo
        return getSectionBObjects(contentX, contentY, contentWidth, height - 18, editorState, labelData);
      case "C": // C1: Delivery Details (left) + C2: Barcode (right)
        return getSectionCObjects(contentX, contentY, contentWidth, height - 18, editorState, labelData);
      case "D": // Items Table
        return getSectionDObjects(contentX, contentY, contentWidth, height - 18, editorState, labelData);
      case "E": // E1: Shipped By (left) + E2: Order Information (right)
        return getSectionEObjects(contentX, contentY, contentWidth, height - 18, editorState, labelData);
      case "F": // Charges
        return getSectionFObjects(contentX, contentY, contentWidth, height - 18, editorState, labelData);
      default:
        return [];
    }
  };

  const getSectionAObjects = (
    x: number,
    y: number,
    width: number,
    height: number,
    editorState: LabelEditorState,
    labelData: LabelData,
  ): fabric.Object[] => {
    const objects: fabric.Object[] = [];

    // A1: Ship To (left side - 60%)
    const a1Width = width * 0.55;
    const a2Width = width * 0.45;

    // A1 content: Ship To
    let currentY = y + 2;

    if (editorState.shipTo?.isVisible !== false) {
      const shipToLabel = new fabric.Text("SHIP TO", {
        left: x + 3,
        top: currentY,
        fontSize: editorState.shipTo?.fontSize || 10,
        fontFamily: "Arial, sans-serif",
        fontWeight: "bold",
        fill: "#000000",
        selectable: false,
        evented: false,
      });
      objects.push(shipToLabel);
      currentY += (editorState.shipTo?.fontSize || 10) + 5;
    }

    if (editorState.shipToName?.isVisible !== false) {
      const customerName = new fabric.Text(labelData.shipToName.toUpperCase(), {
        left: x + 3,
        top: currentY,
        fontSize: editorState.shipToName?.fontSize || 16,
        fontFamily: "Arial, sans-serif",
        fontWeight: "bold",
        fill: "#000000",
        selectable: false,
        evented: false,
      });
      objects.push(customerName);
      currentY += (editorState.shipToName?.fontSize || 16) + 5;
    }

    if (editorState.shipToAddress1?.isVisible !== false) {
      const address1 = new fabric.Text(labelData.shipToAddress1, {
        left: x + 3,
        top: currentY,
        fontSize: editorState.shipToAddress1?.fontSize || 11,
        fontFamily: "Arial, sans-serif",
        fill: "#000000",
        selectable: false,
        evented: false,
      });
      objects.push(address1);
      currentY += (editorState.shipToAddress1?.fontSize || 11) + 5;
    }

    if (editorState.shipToAddress2?.isVisible !== false) {
      const address2 = new fabric.Text(labelData.shipToAddress2, {
        left: x + 3,
        top: currentY,
        fontSize: editorState.shipToAddress2?.fontSize || 11,
        fontFamily: "Arial, sans-serif",
        fill: "#000000",
        selectable: false,
        evented: false,
      });
      objects.push(address2);
      currentY += (editorState.shipToAddress2?.fontSize || 11) + 5;
    }

    if (editorState.shipToCity?.isVisible !== false) {
      const cityState = new fabric.Text(labelData.shipToCity, {
        left: x + 3,
        top: currentY,
        fontSize: editorState.shipToCity?.fontSize || 11,
        fontFamily: "Arial, sans-serif",
        fill: "#000000",
        selectable: false,
        evented: false,
      });
      objects.push(cityState);
      currentY += (editorState.shipToCity?.fontSize || 11) + 5;
    }

    if (editorState.shipToPhone?.isVisible !== false) {
      const phone = new fabric.Text(`Phone: ${labelData.shipToPhone}`, {
        left: x + 3,
        top: currentY,
        fontSize: editorState.shipToPhone?.fontSize || 11,
        fontFamily: "Arial, sans-serif",
        fill: "#000000",
        selectable: false,
        evented: false,
      });
      objects.push(phone);
    }

    // A2 content: Customer Logo
    if (editorState.customerLogo?.isVisible !== false) {
      const a2RightEdge = x + width - 3;
      const logoLabel = new fabric.Text("CUSTOMER LOGO", {
        left: a2RightEdge,
        top: y + 2,
        fontSize: editorState.customerLogo?.fontSize || 10,
        fontFamily: "Arial, sans-serif",
        fontWeight: "bold",
        fill: "#000000",
        originX: "right",
        selectable: false,
        evented: false,
      });
      objects.push(logoLabel);

      // Logo placeholder (right-aligned)
      const logoBox = new fabric.Rect({
        left: a2RightEdge - 80,
        top: y + 20,
        width: 80,
        height: 60,
        fill: "#ffffff",
        stroke: "#000000",
        strokeWidth: 1,
        selectable: false,
        evented: false,
      });
      objects.push(logoBox);

      const logoText = new fabric.Text("[LOGO]", {
        left: a2RightEdge - 40,
        top: y + 43,
        fontSize: 12,
        fontFamily: "Arial, sans-serif",
        fill: "#888888",
        originX: "center",
        selectable: false,
        evented: false,
      });
      objects.push(logoText);
    }

    return objects;
  };

  const getSectionBObjects = (
    x: number,
    y: number,
    width: number,
    height: number,
    editorState: LabelEditorState,
    labelData: LabelData,
  ): fabric.Object[] => {
    const objects: fabric.Object[] = [];

    // B1: Partner Logo (left side - 25%)
    const b1Width = width * 0.25;
    // B2: Legal Disclaimer (right side - 75%)
    const b2Width = width * 0.75;

    // B1 content: Partner Logo (mandatory)
    const b1X = x + 3;
    const b1Y = y + 2;

    if (editorState.partnerLogo?.isVisible !== false) {
      // Partner logo placeholder
      const partnerLogoBox = new fabric.Rect({
        left: b1X,
        top: b1Y,
        width: 60,
        height: 40,
        fill: "#ffffff",
        stroke: "#000000",
        strokeWidth: 1,
        selectable: false,
        evented: false,
      });
      objects.push(partnerLogoBox);

      const partnerLogoText = new fabric.Text("[PARTNER LOGO]", {
        left: b1X + 30,
        top: b1Y + 20,
        fontSize: 7,
        fontFamily: "Arial, sans-serif",
        fill: "#888888",
        originX: "center",
        originY: "center",
        selectable: false,
        evented: false,
      });
      objects.push(partnerLogoText);
    }

    // B2 content: Legal Disclaimer (right side)
    const b2X = x + b1Width + 10;
    const b2Y = y + 2;

    if (editorState.legalDisclaimer?.isVisible !== false) {
      const disclaimerText = labelData.legalDisclaimer || 
        "This shipment is subject to the terms and conditions of the shipping partner. " +
        "The recipient is responsible for any customs duties, taxes, or fees. " +
        "For claims or disputes, contact customer support within 30 days of delivery. " +
        "Vamaship and its partners are not liable for delays due to circumstances beyond our control.";

      // Calculate available width for text wrapping
      const maxWidth = b2Width - 6;
      const fontSize = editorState.legalDisclaimer?.fontSize || 8;
      const maxHeight = height - 4; // Leave some padding
      
      // Use Textbox for proper text wrapping
      const legalText = new fabric.Textbox(disclaimerText, {
        left: b2X,
        top: b2Y,
        width: maxWidth,
        fontSize: fontSize,
        fontFamily: "Arial, sans-serif",
        fill: "#000000",
        splitByGrapheme: true, // Better text wrapping
        textAlign: "left",
        lineHeight: 1.2,
        selectable: false,
        evented: false,
        lockMovementX: true,
        lockMovementY: true,
        lockRotation: true,
        lockScalingX: true,
        lockScalingY: true,
      });
      
      // Ensure text doesn't exceed section height
      if (legalText.height && legalText.height > maxHeight) {
        legalText.set({ height: maxHeight });
      }
      
      objects.push(legalText);
    }

    return objects;
  };

  const getSectionCObjects = (
    x: number,
    y: number,
    width: number,
    height: number,
    editorState: LabelEditorState,
    labelData: LabelData,
  ): fabric.Object[] => {
    const objects: fabric.Object[] = [];

    // C1: Delivery Details (left side - 60%)
    const c1Width = width * 0.55;
    const c2Width = width * 0.45;

    // C1 content: Delivery Details
    let c1Y = y + 2;

    if (editorState.dimensions?.isVisible !== false) {
      const dims = new fabric.Text(labelData.dimensions, {
        left: x + 3,
        top: c1Y,
        fontSize: editorState.dimensions?.fontSize || 11,
        fontFamily: "Arial, sans-serif",
        fill: "#000000",
        selectable: false,
        evented: false,
      });
      objects.push(dims);
      c1Y += (editorState.dimensions?.fontSize || 11) + 5;
    }

    if (editorState.paymentMethod?.isVisible !== false) {
      const payment = new fabric.Text(labelData.paymentMethod, {
        left: x + 3,
        top: c1Y,
        fontSize: editorState.paymentMethod?.fontSize || 11,
        fontFamily: "Arial, sans-serif",
        fill: "#000000",
        selectable: false,
        evented: false,
      });
      objects.push(payment);
      c1Y += (editorState.paymentMethod?.fontSize || 11) + 5;
    }

    if (editorState.orderTotal?.isVisible !== false) {
      const orderTotal = new fabric.Text(labelData.orderTotal, {
        left: x + 3,
        top: c1Y,
        fontSize: editorState.orderTotal?.fontSize || 11,
        fontFamily: "Arial, sans-serif",
        fill: "#000000",
        selectable: false,
        evented: false,
      });
      objects.push(orderTotal);
      c1Y += (editorState.orderTotal?.fontSize || 11) + 5;
    }

    if (editorState.weight?.isVisible !== false) {
      const weight = new fabric.Text(labelData.weight, {
        left: x + 3,
        top: c1Y,
        fontSize: editorState.weight?.fontSize || 11,
        fontFamily: "Arial, sans-serif",
        fill: "#000000",
        selectable: false,
        evented: false,
      });
      objects.push(weight);
      c1Y += (editorState.weight?.fontSize || 11) + 5;
    }

    if (editorState.ewaybillNumber?.isVisible !== false) {
      const ewaybill = new fabric.Text(labelData.ewaybillNumber, {
        left: x + 3,
        top: c1Y,
        fontSize: editorState.ewaybillNumber?.fontSize || 11,
        fontFamily: "Arial, sans-serif",
        fill: "#000000",
        selectable: false,
        evented: false,
      });
      objects.push(ewaybill);
      c1Y += (editorState.ewaybillNumber?.fontSize || 11) + 5;
    }

    if (editorState.routingCode?.isVisible !== false) {
      const routing = new fabric.Text(labelData.routingCode, {
        left: x + 3,
        top: c1Y,
        fontSize: editorState.routingCode?.fontSize || 11,
        fontFamily: "Arial, sans-serif",
        fill: "#000000",
        selectable: false,
        evented: false,
      });
      objects.push(routing);
      c1Y += (editorState.routingCode?.fontSize || 11) + 5;
    }

    if (editorState.rtoRoutingCode?.isVisible !== false) {
      const rtoRouting = new fabric.Text(labelData.rtoRoutingCode, {
        left: x + 3,
        top: c1Y,
        fontSize: editorState.rtoRoutingCode?.fontSize || 11,
        fontFamily: "Arial, sans-serif",
        fill: "#000000",
        selectable: false,
        evented: false,
      });
      objects.push(rtoRouting);
    }

    // C2 content: VAMASHIP + AWB + Barcode
    const c2RightEdge = x + width - 3;
    let c2Y = y + 2;

    // VAMASHIP label (right-aligned)
    const vamashipLabel = new fabric.Text("VAMASHIP", {
      left: c2RightEdge,
      top: c2Y,
      fontSize: 12,
      fontFamily: "Arial, sans-serif",
      fontWeight: "bold",
      fill: "#2563eb", // Blue color
      originX: "right",
      selectable: false,
      evented: false,
    });
    objects.push(vamashipLabel);
    c2Y += 20;

    // AWB Number above barcode (right-aligned)
    if (editorState.awbNumber?.isVisible !== false) {
      const awb = new fabric.Text(labelData.awbNumber, {
        left: c2RightEdge,
        top: c2Y,
        fontSize: editorState.awbNumber?.fontSize || 11,
        fontFamily: "Arial, sans-serif",
        fontWeight: "bold",
        fill: "#000000",
        originX: "right",
        selectable: false,
        evented: false,
      });
      objects.push(awb);
      c2Y += (editorState.awbNumber?.fontSize || 11) + 5;
    }

    // Realistic barcode visualization (right-aligned)
    const barcodeWidth = c2Width - 40;
    const barcodeHeight = 50;
    const barcodeX = c2RightEdge - barcodeWidth;
    const barcodeY = c2Y;

    // Create a more realistic barcode pattern with varied bar widths
    // Using a pattern that simulates Code 128 or similar barcode
    const barcodePattern = [3, 1, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 1, 3, 1, 1, 2, 1, 3, 1, 2];
    let currentX = barcodeX;
    const barUnit = barcodeWidth / barcodePattern.reduce((a, b) => a + b, 0);

    const barcodeElements: fabric.Object[] = [];
    barcodePattern.forEach((width, index) => {
      if (index % 2 === 0) { // Black bars on even indices
        const bar = new fabric.Rect({
          left: currentX - barcodeX,
          top: 0,
          width: width * barUnit,
          height: barcodeHeight,
          fill: "#000000",
          selectable: false,
          evented: false,
        });
        barcodeElements.push(bar);
      }
      currentX += width * barUnit;
    });

    // Barcode text (right-aligned below barcode)
    const barcodeNumText = labelData.awbNumber.replace(/[^\d]/g, "");
    const barcodeText = new fabric.Text(barcodeNumText, {
      left: barcodeWidth,
      top: barcodeHeight + 5,
      fontSize: 11,
      fontFamily: "Arial, sans-serif",
      fill: "#000000",
      originX: "right",
      selectable: false,
      evented: false,
    });
    barcodeElements.push(barcodeText);

    // Group barcode elements with metadata
    const barcodeGroup = new fabric.Group(barcodeElements, {
      left: barcodeX,
      top: barcodeY,
      selectable: false,
      evented: false,
    });
    (barcodeGroup as any).data = {
      elementType: 'barcode',
      barcodeData: labelData.awbNumber,
    };
    objects.push(barcodeGroup);

    return objects;
  };

  const getSectionDObjects = (
    x: number,
    y: number,
    width: number,
    height: number,
    editorState: LabelEditorState,
    labelData: LabelData,
  ): fabric.Object[] => {
    const objects: fabric.Object[] = [];

    let tableY = y + 2;

    // Define all columns with their properties
    const columnDefinitions = [
      { key: "itemColumn" as LabelFieldKey, header: "Item", dataKey: "item", baseWidth: 0.15 },
      { key: "skuColumn" as LabelFieldKey, header: "SKU", dataKey: "sku", baseWidth: 0.1 },
      { key: "qtyColumn" as LabelFieldKey, header: "Qty", dataKey: "qty", baseWidth: 0.08 },
      { key: "priceColumn" as LabelFieldKey, header: "Price", dataKey: "price", baseWidth: 0.15 },
      { key: "hsnColumn" as LabelFieldKey, header: "HSN", dataKey: "hsn", baseWidth: 0.12 },
      { key: "taxableValueColumn" as LabelFieldKey, header: "Taxable Value", dataKey: "taxableValue", baseWidth: 0.2 },
      { key: "totalColumn" as LabelFieldKey, header: "Total", dataKey: "total", baseWidth: 0.2 },
    ];

    // Filter to only visible columns
    const visibleColumns = columnDefinitions.filter(
      (col) => editorState[col.key]?.isVisible !== false
    );

    // Only render table if at least one column is visible
    if (visibleColumns.length > 0) {
      // Calculate column widths based on visible columns
      const totalBaseWidth = visibleColumns.reduce((sum, col) => sum + col.baseWidth, 0);
      const colWidths = visibleColumns.map((col) => (col.baseWidth / totalBaseWidth) * width);

      let xOffset = 0;

      // Table headers
      visibleColumns.forEach((col, idx) => {
        const headerText = new fabric.Text(col.header, {
          left: x + xOffset + 3,
          top: tableY,
          fontSize: 14,
          fontFamily: "Arial, sans-serif",
          fontWeight: "bold",
          fill: "#000000",
          selectable: false,
          evented: false,
        });
        objects.push(headerText);
        xOffset += colWidths[idx];
      });

      // Table rows - increased spacing between headers and first row
      let rowY = tableY + 25; // Increased from 18 to add more padding between headers and rows
      const visibleItems = labelData.items.slice(0, 5);

      visibleItems.forEach((item, rowIdx) => {
        xOffset = 0;

        visibleColumns.forEach((col, colIdx) => {
          let cellValue: string;
          if (col.dataKey === "qty") {
            cellValue = item.qty.toString();
          } else {
            cellValue = item[col.dataKey as keyof typeof item] as string;
          }

          const cellText = new fabric.Text(cellValue, {
            left: x + xOffset + 3,
            top: rowY,
            fontSize: 12,
            fontFamily: "Arial, sans-serif",
            fill: "#000000",
            selectable: false,
            evented: false,
          });
          objects.push(cellText);
          xOffset += colWidths[colIdx];
        });

        rowY += 20; // Increased padding between rows (removed divider lines)
      });
    } // End of items table visibility check

    return objects;
  };

  const getSectionFObjects = (
    x: number,
    y: number,
    width: number,
    height: number,
    editorState: LabelEditorState,
    labelData: LabelData,
  ): fabric.Object[] => {
    const objects: fabric.Object[] = [];

    // Charges section (2 columns layout)
    let chargesY = y + 2;
    const leftColX = x + 3;
    const rightColX = x + width - 3; // Right edge for right-aligned text

    // Left column: Platform Fee and Shipping Charges
    let leftY = chargesY;
    if (editorState.platformFee?.isVisible !== false) {
      const platformFeeText = new fabric.Text(labelData.platformFee, {
        left: leftColX,
        top: leftY,
        fontSize: editorState.platformFee?.fontSize || 11,
        fontFamily: "Arial, sans-serif",
        fill: "#000000",
        selectable: false,
        evented: false,
      });
      objects.push(platformFeeText);
      leftY += (editorState.platformFee?.fontSize || 11) + 8;
    }

    if (editorState.shippingCharges?.isVisible !== false) {
      const shippingChargesText = new fabric.Text(labelData.shippingCharges, {
        left: leftColX,
        top: leftY,
        fontSize: editorState.shippingCharges?.fontSize || 11,
        fontFamily: "Arial, sans-serif",
        fill: "#000000",
        selectable: false,
        evented: false,
      });
      objects.push(shippingChargesText);
      leftY += (editorState.shippingCharges?.fontSize || 11) + 8;
    }

    // Right column: Discount and Collectable Amount (right-aligned)
    let rightY = chargesY;
    if (editorState.discount?.isVisible !== false) {
      const discountText = new fabric.Text(labelData.discount, {
        left: rightColX,
        top: rightY,
        fontSize: editorState.discount?.fontSize || 11,
        fontFamily: "Arial, sans-serif",
        fill: "#000000",
        originX: "right",
        selectable: false,
        evented: false,
      });
      objects.push(discountText);
      rightY += (editorState.discount?.fontSize || 11) + 8;
    }

    if (editorState.collectableAmount?.isVisible !== false) {
      const collectableText = new fabric.Text(labelData.collectableAmount, {
        left: rightColX,
        top: rightY,
        fontSize: editorState.collectableAmount?.fontSize || 11,
        fontFamily: "Arial, sans-serif",
        fontWeight: "bold",
        fill: "#000000",
        originX: "right",
        selectable: false,
        evented: false,
      });
      objects.push(collectableText);
    }

    return objects;
  };

  const getSectionEObjects = (
    x: number,
    y: number,
    width: number,
    height: number,
    editorState: LabelEditorState,
    labelData: LabelData,
  ): fabric.Object[] => {
    const objects: fabric.Object[] = [];

    // E1: Shipped By (left side - 60%)
    const e1Width = width * 0.55;
    const e2Width = width * 0.45;

    // E1 content: Return address (left side)
    let eY = y + 2;
    
    // Section heading
    const headingText = new fabric.Text("Shipped By (If undelivered return to) ", {
      left: x + 3,
      top: eY,
      fontSize: 11,
      fontFamily: "Arial, sans-serif",
      fontWeight: "bold",
      fill: "#000000",
      selectable: false,
      evented: false,
    });
    objects.push(headingText);
    eY += 18;
    if (editorState.returnName?.isVisible !== false) {
      const returnName = new fabric.Text(labelData.returnName, {
        left: x + 3,
        top: eY,
        fontSize: editorState.returnName?.fontSize || 12,
        fontFamily: "Arial, sans-serif",
        fontWeight: "bold",
        fill: "#000000",
        selectable: false,
        evented: false,
      });
      objects.push(returnName);
      eY += (editorState.returnName?.fontSize || 12) + 5;
    }

    if (editorState.returnAddress1?.isVisible !== false) {
      const returnAddress1 = new fabric.Text(labelData.returnAddress1, {
        left: x + 3,
        top: eY,
        fontSize: editorState.returnAddress1?.fontSize || 11,
        fontFamily: "Arial, sans-serif",
        fill: "#000000",
        selectable: false,
        evented: false,
      });
      objects.push(returnAddress1);
      eY += (editorState.returnAddress1?.fontSize || 11) + 5;
    }

    if (editorState.returnAddress2?.isVisible !== false) {
      const returnAddress2 = new fabric.Text(labelData.returnAddress2, {
        left: x + 3,
        top: eY,
        fontSize: editorState.returnAddress2?.fontSize || 11,
        fontFamily: "Arial, sans-serif",
        fill: "#000000",
        selectable: false,
        evented: false,
      });
      objects.push(returnAddress2);
      eY += (editorState.returnAddress2?.fontSize || 11) + 5;
    }

    if (editorState.returnCity?.isVisible !== false) {
      const returnCity = new fabric.Text(labelData.returnCity, {
        left: x + 3,
        top: eY,
        fontSize: editorState.returnCity?.fontSize || 11,
        fontFamily: "Arial, sans-serif",
        fill: "#000000",
        selectable: false,
        evented: false,
      });
      objects.push(returnCity);
      eY += (editorState.returnCity?.fontSize || 11) + 5;
    }

    if (editorState.returnPhone?.isVisible !== false) {
      const returnPhone = new fabric.Text(`Phone: ${labelData.returnPhone}`, {
        left: x + 3,
        top: eY,
        fontSize: editorState.returnPhone?.fontSize || 11,
        fontFamily: "Arial, sans-serif",
        fill: "#000000",
        selectable: false,
        evented: false,
      });
      objects.push(returnPhone);
      eY += (editorState.returnPhone?.fontSize || 11) + 5;
    }

    if (editorState.customerCare?.isVisible !== false) {
      const customerCare = new fabric.Text(labelData.customerCare, {
        left: x + 3,
        top: eY,
        fontSize: editorState.customerCare?.fontSize || 11,
        fontFamily: "Arial, sans-serif",
        fill: "#000000",
        selectable: false,
        evented: false,
      });
      objects.push(customerCare);
      eY += (editorState.customerCare?.fontSize || 11) + 5;
    }

    if (editorState.customerEmail?.isVisible !== false) {
      const customerEmail = new fabric.Text(labelData.customerEmail, {
        left: x + 3,
        top: eY,
        fontSize: editorState.customerEmail?.fontSize || 11,
        fontFamily: "Arial, sans-serif",
        fill: "#000000",
        selectable: false,
        evented: false,
      });
      objects.push(customerEmail);
    }

    // E2 content: Order Information (right side)
    const e2RightEdge = x + width - 3;
    let e2Y = y + 2;

    if (editorState.orderNumber?.isVisible !== false) {
      const orderNumber = new fabric.Text(labelData.orderNumber, {
        left: e2RightEdge,
        top: e2Y,
        fontSize: editorState.orderNumber?.fontSize || 11,
        fontFamily: "Arial, sans-serif",
        fill: "#000000",
        originX: "right",
        selectable: false,
        evented: false,
      });
      objects.push(orderNumber);
      e2Y += (editorState.orderNumber?.fontSize || 11) + 5;
    }

    if (editorState.invoiceNumber?.isVisible !== false) {
      const invoiceNumber = new fabric.Text(labelData.invoiceNumber, {
        left: e2RightEdge,
        top: e2Y,
        fontSize: editorState.invoiceNumber?.fontSize || 11,
        fontFamily: "Arial, sans-serif",
        fill: "#000000",
        originX: "right",
        selectable: false,
        evented: false,
      });
      objects.push(invoiceNumber);
      e2Y += (editorState.invoiceNumber?.fontSize || 11) + 5;
    }

    if (editorState.invoiceDate?.isVisible !== false) {
      const invoiceDate = new fabric.Text(labelData.invoiceDate, {
        left: e2RightEdge,
        top: e2Y,
        fontSize: editorState.invoiceDate?.fontSize || 11,
        fontFamily: "Arial, sans-serif",
        fill: "#000000",
        originX: "right",
        selectable: false,
        evented: false,
      });
      objects.push(invoiceDate);
      e2Y += (editorState.invoiceDate?.fontSize || 11) + 5;
    }

    if (editorState.orderDate?.isVisible !== false) {
      const orderDate = new fabric.Text(labelData.orderDate, {
        left: e2RightEdge,
        top: e2Y,
        fontSize: editorState.orderDate?.fontSize || 11,
        fontFamily: "Arial, sans-serif",
        fill: "#000000",
        originX: "right",
        selectable: false,
        evented: false,
      });
      objects.push(orderDate);
      e2Y += (editorState.orderDate?.fontSize || 11) + 5;
    }

    if (editorState.gstin?.isVisible !== false) {
      const gstin = new fabric.Text(labelData.gstin, {
        left: e2RightEdge,
        top: e2Y,
        fontSize: editorState.gstin?.fontSize || 11,
        fontFamily: "Arial, sans-serif",
        fill: "#000000",
        originX: "right",
        selectable: false,
        evented: false,
      });
      objects.push(gstin);
    }

    return objects;
  };

  const handlePrint = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Create a new window with the canvas image for printing
    const dataURL = canvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 2,
    });

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Label</title>
          <style>
            @media print {
              @page {
                size: 4in 6in;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
              }
              img {
                width: 100%;
                height: auto;
                display: block;
              }
            }
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            img {
              max-width: 100%;
              height: auto;
            }
          </style>
        </head>
        <body>
          <img src="${dataURL}" alt="Shipping Label" />
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Helper function to get absolute coordinates from an object, accounting for group transformations
  const getAbsoluteCoordinates = (obj: any, group?: any): { x: number; y: number } => {
    if (!group) {
      // Object is directly on canvas, use its position directly
      return {
        x: Math.round((obj.left || 0) * 100) / 100,
        y: Math.round((obj.top || 0) * 100) / 100,
      };
    }

    // Object is inside a group - transform coordinates through group
    // Get the group's transformation matrix
    const groupTransform = group.calcTransformMatrix();
    
    // Get object's local coordinates (relative to group)
    const localX = obj.left || 0;
    const localY = obj.top || 0;
    
    // Transform the point through the group's transformation matrix
    // Matrix format: [a, b, c, d, e, f] where:
    // x' = a*x + c*y + e
    // y' = b*x + d*y + f
    const absoluteX = groupTransform[0] * localX + groupTransform[2] * localY + groupTransform[4];
    const absoluteY = groupTransform[1] * localX + groupTransform[3] * localY + groupTransform[5];
    
    return {
      x: Math.round(absoluteX * 100) / 100,
      y: Math.round(absoluteY * 100) / 100,
    };
  };

  // Helper function to transform a point through a transformation matrix
  const transformPoint = (x: number, y: number, matrix: number[]): { x: number; y: number } => {
    // Matrix format: [a, b, c, d, e, f] where:
    // x' = a*x + c*y + e
    // y' = b*x + d*y + f
    return {
      x: matrix[0] * x + matrix[2] * y + matrix[4],
      y: matrix[1] * x + matrix[3] * y + matrix[5],
    };
  };

  // Helper function to get absolute line coordinates
  const getAbsoluteLineCoordinates = (line: any, group?: any): { x1: number; y1: number; x2: number; y2: number } => {
    // In Fabric.js, line coordinates x1, y1, x2, y2 are stored relative to the line's (left, top)
    // We need to get the absolute coordinates of both endpoints
    
    // Get the line's local coordinates (relative to line's left/top)
    const localX1 = line.x1 || 0;
    const localY1 = line.y1 || 0;
    const localX2 = line.x2 || 0;
    const localY2 = line.y2 || 0;
    
    // Get the line's position (left, top) - this is the bounding box origin
    const lineLeft = line.left || 0;
    const lineTop = line.top || 0;
    
    // Calculate endpoints in group-local coordinates (or canvas coordinates if no group)
    const groupLocalX1 = localX1 + lineLeft;
    const groupLocalY1 = localY1 + lineTop;
    const groupLocalX2 = localX2 + lineLeft;
    const groupLocalY2 = localY2 + lineTop;
    
    if (!group) {
      // Line is directly on canvas - coordinates are already absolute
      return {
        x1: Math.round(groupLocalX1 * 100) / 100,
        y1: Math.round(groupLocalY1 * 100) / 100,
        x2: Math.round(groupLocalX2 * 100) / 100,
        y2: Math.round(groupLocalY2 * 100) / 100,
      };
    }

    // Line is inside a group - transform coordinates through group
    // Get the group's transformation matrix
    const groupTransform = group.calcTransformMatrix();
    
    // Transform both endpoints through the group's transformation matrix
    const p1 = transformPoint(groupLocalX1, groupLocalY1, groupTransform);
    const p2 = transformPoint(groupLocalX2, groupLocalY2, groupTransform);
    
    return {
      x1: Math.round(p1.x * 100) / 100,
      y1: Math.round(p1.y * 100) / 100,
      x2: Math.round(p2.x * 100) / 100,
      y2: Math.round(p2.y * 100) / 100,
    };
  };

  const handleExportJSON = () => {
    if (!fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;

    // Extract all rendered elements from the canvas
    const renderedElements: any[] = [];

    canvas.getObjects().forEach((obj: any) => {
      // Skip sections themselves, process their children
      if (obj.data?.type === 'section' && obj.type === 'group') {
        // Process all objects within the section
        obj.getObjects().forEach((child: any) => {
          // Get absolute coordinates using Fabric.js transformation
          const coords = getAbsoluteCoordinates(child, obj);
          
          const element = extractElementData(child, coords.x, coords.y, obj);
          if (element) {
            renderedElements.push(element);
          }
        });
      } 
      // Process border strip elements (vamaship text around perimeter)
      // These are directly on the canvas, so their positions are already absolute
      else if (obj.data?.type === 'border-strip') {
        const coords = getAbsoluteCoordinates(obj);
        const element = extractElementData(obj, coords.x, coords.y);
        if (element) {
          renderedElements.push(element);
        }
      }
      // Process decorative border rectangles
      // These are directly on the canvas, so their positions are already absolute
      else if (obj.data?.type === 'border-rect') {
        const coords = getAbsoluteCoordinates(obj);
        const element = extractElementData(obj, coords.x, coords.y);
        if (element) {
          renderedElements.push(element);
        }
      }
    });

    // Create the comprehensive configuration
    const labelConfig = {
      version: "1.0",
      canvas: {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        borderStripWidth: BORDER_STRIP_WIDTH,
      },
      sections: {
        order: state.sectionOrder,
        heights: state.sectionHeights,
      },
      renderedElements,
    };

    // Convert to JSON and open in new tab
    const jsonString = JSON.stringify(labelConfig, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(url, "_blank");
    if (newWindow) {
      // Clean up the URL after a delay to allow the browser to load it
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } else {
      // Fallback to download if popup is blocked
      const link = document.createElement("a");
      link.href = url;
      link.download = `label-config-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Helper function to extract element data with absolute positioning
  // absoluteX and absoluteY are the absolute canvas coordinates (top-left corner)
  const extractElementData = (obj: any, absoluteX: number, absoluteY: number, group?: any): any | null => {

    // Base properties common to all elements
    const baseData: any = {
      type: obj.type,
      x: Math.round(absoluteX * 100) / 100,
      y: Math.round(absoluteY * 100) / 100,
    };

    // Add element-specific properties
    switch (obj.type) {
      case 'text':
      case 'textbox':
        // For text with originX: "right", the left property is the right edge
        // We need to calculate the actual left edge for proper export
        const textWidth = Math.round((obj.width || 0) * (obj.scaleX || 1) * 100) / 100;
        let textX = absoluteX;
        if (obj.originX === 'right') {
          // If originX is right, absoluteX is the right edge, so subtract width to get left edge
          textX = absoluteX - textWidth;
        } else if (obj.originX === 'center') {
          // If originX is center, absoluteX is the center, so subtract half width to get left edge
          textX = absoluteX - textWidth / 2;
        }
        // For originX: "left" (default), absoluteX is already the left edge
        
        return {
          type: obj.type,
          x: Math.round(textX * 100) / 100,
          y: Math.round(absoluteY * 100) / 100,
          elementType: 'text',
          text: obj.text || '',
          fontSize: obj.fontSize || 12,
          fontFamily: obj.fontFamily || 'Arial',
          fontWeight: obj.fontWeight || 'normal',
          fontStyle: obj.fontStyle || 'normal',
          fill: obj.fill || '#000000',
          textAlign: obj.textAlign || 'left',
          width: textWidth,
          height: Math.round((obj.height || 0) * (obj.scaleY || 1) * 100) / 100,
        };

      case 'rect':
        return {
          ...baseData,
          elementType: 'rectangle',
          width: Math.round((obj.width || 0) * (obj.scaleX || 1) * 100) / 100,
          height: Math.round((obj.height || 0) * (obj.scaleY || 1) * 100) / 100,
          fill: obj.fill || 'transparent',
          stroke: obj.stroke || '#000000',
          strokeWidth: obj.strokeWidth || 0,
          rx: obj.rx || 0,
          ry: obj.ry || 0,
        };

      case 'line':
        // Get absolute line coordinates using transformation
        const lineCoords = getAbsoluteLineCoordinates(obj, group);
        // For lines, x and y should represent the top-left of the bounding box
        // which is the minimum of the endpoints
        const lineX = Math.min(lineCoords.x1, lineCoords.x2);
        const lineY = Math.min(lineCoords.y1, lineCoords.y2);
        return {
          type: obj.type,
          x: Math.round(lineX * 100) / 100,
          y: Math.round(lineY * 100) / 100,
          elementType: 'line',
          x1: lineCoords.x1,
          y1: lineCoords.y1,
          x2: lineCoords.x2,
          y2: lineCoords.y2,
          stroke: obj.stroke || '#000000',
          strokeWidth: obj.strokeWidth || 1,
        };

      case 'image':
        return {
          ...baseData,
          elementType: 'image',
          width: Math.round((obj.width || 0) * (obj.scaleX || 1) * 100) / 100,
          height: Math.round((obj.height || 0) * (obj.scaleY || 1) * 100) / 100,
          src: obj.getSrc ? obj.getSrc() : '',
        };

      case 'group':
        // Handle barcode groups or other nested groups
        if (obj.data?.elementType === 'barcode') {
          return {
            ...baseData,
            elementType: 'barcode',
            width: Math.round((obj.width || 0) * (obj.scaleX || 1) * 100) / 100,
            height: Math.round((obj.height || 0) * (obj.scaleY || 1) * 100) / 100,
            barcodeData: obj.data?.barcodeData || '',
          };
        }
        // Skip other groups as they're structural
        return null;

      default:
        return null;
    }
  };

  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Drag sections to reorder</h3>
            <p className="text-muted-foreground text-xs">Sections can be moved up or down</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportJSON} size="sm" variant="outline">
              <FileJson className="mr-2 h-4 w-4" />
              Export Config
            </Button>
            <Button onClick={handlePrint} size="sm" variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </div>
        <div className="w-full overflow-auto">
          <canvas ref={canvasRef} className="border shadow-lg" style={{ display: "block", maxWidth: "100%" }} />
        </div>
      </CardContent>
    </Card>
  );
}

