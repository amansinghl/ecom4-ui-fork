"use client";

import type { LabelEditorState, LabelFieldKey, LabelData } from "@/types/labels";
import { FIELD_SECTIONS } from "@/configs/printables";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Settings2 } from "lucide-react";
import { useState } from "react";
// import { LabelData } from "./types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type LabelControlsProps = {
  state: LabelEditorState;
  data: LabelData;
  onToggle: (field: LabelFieldKey, isVisible: boolean) => void;
  onFontSizeChange: (field: LabelFieldKey, size: number) => void;
  onDataChange: (field: keyof LabelData, value: string) => void;
};

export function LabelControls({ state, data, onToggle, onFontSizeChange, onDataChange }: LabelControlsProps) {
  const [openSections, setOpenSections] = useState<string[]>(["Shipping Information", "Order Information", "Custom Text"]);

  const toggleSection = (sectionTitle: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionTitle) ? prev.filter((s) => s !== sectionTitle) : [...prev, sectionTitle],
    );
  };

  return (
    <Card className="h-full w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Label Options</CardTitle>
        <p className="text-muted-foreground text-sm">Toggle fields to show or hide them on your label</p>
      </CardHeader>
      <Separator />
      <CardContent className="max-h-[calc(100vh-200px)] space-y-4 overflow-y-auto pt-4">
        {FIELD_SECTIONS.map((section) => (
          <Collapsible
            key={section.title}
            open={openSections.includes(section.title)}
            onOpenChange={() => toggleSection(section.title)}
          >
            <CollapsibleTrigger className="hover:bg-muted/50 flex w-full items-center justify-between rounded-md p-2 transition-colors">
              <h4 className="text-foreground text-sm font-medium">{section.title}</h4>
              {openSections.includes(section.title) ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="ml-2 grid grid-cols-2 gap-1.5 lg:grid-cols-3">
                {section.fields.map(({ key, label }) => (
                  <div
                    key={key}
                    className="hover:bg-muted/30 flex items-center gap-1.5 rounded-md p-1.5 transition-colors"
                  >
                    <Checkbox
                      id={`field-${key}`}
                      checked={state[key].isVisible}
                      onCheckedChange={(checked) => onToggle(key, Boolean(checked))}
                      className="h-3.5 w-3.5"
                    />
                    <Label htmlFor={`field-${key}`} className="flex-1 cursor-pointer text-xs leading-tight">
                      {label}
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 flex-shrink-0"
                          aria-label={`Edit ${label} font size`}
                        >
                          <Settings2 className="h-3 w-3" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64" align="end">
                        <div className="space-y-3">
                          <div className="text-sm font-medium">{label} Font Size</div>
                          <Slider
                            value={[state[key].fontSize]}
                            min={8}
                            max={32}
                            step={1}
                            onValueChange={([v]) => onFontSizeChange(key, v)}
                          />
                          <div className="text-muted-foreground text-xs">{state[key].fontSize}px</div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
        
        {/* Custom Text Section */}
        <Collapsible
          open={openSections.includes("Custom Text")}
          onOpenChange={() => toggleSection("Custom Text")}
        >
          <CollapsibleTrigger className="hover:bg-muted/50 flex w-full items-center justify-between rounded-md p-2 transition-colors">
            <h4 className="text-foreground text-sm font-medium">Custom Text</h4>
            {openSections.includes("Custom Text") ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="ml-2 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer-email" className="text-xs font-medium">
                  Customer Email
                </Label>
                <Input
                  id="customer-email"
                  value={data.customerEmail || ""}
                  onChange={(e) => onDataChange("customerEmail", e.target.value)}
                  placeholder="Customer Email: vamaship@.com"
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-phone" className="text-xs font-medium">
                  Customer Phone
                </Label>
                <Input
                  id="customer-phone"
                  value={data.returnPhone || ""}
                  onChange={(e) => onDataChange("returnPhone", e.target.value)}
                  placeholder="6969696969"
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="legal-disclaimer" className="text-xs font-medium">
                  Legal Disclaimer
                </Label>
                <Textarea
                  id="legal-disclaimer"
                  value={data.legalDisclaimer || ""}
                  onChange={(e) => onDataChange("legalDisclaimer", e.target.value)}
                  placeholder="Enter legal disclaimer text..."
                  className="min-h-[100px] text-xs resize-none"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
