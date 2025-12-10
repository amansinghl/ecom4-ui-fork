"use client";

import { useMemo } from "react";
import { useQuickShip } from "@/hooks/use-quick-ship";
import { useBranches } from "@/hooks/use-user";
import { ShipmentOptions } from "@/components/quick-ship/shipment-options";
import { ShipmentAddress } from "@/components/quick-ship/shipment-address";
import { ReturnAddress } from "@/components/quick-ship/return-address";
import { ShipmentProducts } from "@/components/quick-ship/shipment-products";
import { ShipmentPackages } from "@/components/quick-ship/shipment-packages";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Package, MapPin, ShoppingCart, Box, ArrowRight } from "lucide-react";

export default function QuickShip() {
  const { data: branchesData, isLoading: branchesLoading } = useBranches();
  const branches = branchesData?.branches ?? [];
  
  // Get default branch (is_default = 1) or first branch
  const defaultBranch = useMemo(() => {
    return branches.find((b) => b.is_default === 1) || branches[0];
  }, [branches]);
  
  const branchId = defaultBranch?.gst_number || "";

  const { form, onSubmit, isLoading } = useQuickShip(branchId);
  const useDifferentReturnAddress = form.watch("useDifferentReturnAddress");
  
  const formattedBranches = useMemo(() => {
    return branches.map((b) => ({
      id: b.id,
      name: `${b.branch}${b.gst_number !== "UNKNOWN" ? ` (${b.gst_number})` : ""}`,
      gst_number: b.gst_number,
      is_default: b.is_default === 1,
    }));
  }, [branches]);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      
      <form
        id="quick-ship-form"
        onSubmit={onSubmit}
        className="flex-1 overflow-hidden"
      >
        <div className="h-full grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2">
            <Card className="border-2 shadow-lg">
              <CardHeader className="border-b pb-0!">
                <CardTitle className="flex items-center gap-2.5 text-lg font-bold text-foreground">
                  <Box className="h-5 w-5 text-primary" />
                  Shipment Options
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ShipmentOptions form={form} />
              </CardContent>
            </Card>

            <Card className="border-2 shadow-lg flex-1">
              <CardHeader className="border-b pb-0!">
                <CardTitle className="flex items-center gap-2.5 text-lg font-bold text-foreground">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Products
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ShipmentProducts form={form} branches={formattedBranches} />
              </CardContent>
            </Card>
          </div>

          <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 overflow-y-auto relative">
            <div className="flex-1 pb-20">
              <div className={`grid grid-cols-1 gap-4 ${useDifferentReturnAddress ? 'xl:grid-cols-3' : 'xl:grid-cols-2'}`}>
                <Card className="border-2 shadow-lg">
                  <CardHeader className="border-b pb-0!">
                    <CardTitle className="flex items-center gap-2.5 text-lg font-bold text-foreground">
                      <MapPin className="h-5 w-5 text-primary" />
                      Origin
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ShipmentAddress
                      form={form}
                      addressPrefix="originAddress"
                      title="Origin Address"
                    />
                  </CardContent>
                </Card>

                {useDifferentReturnAddress && (
                  <Card className="border-2 shadow-lg">
                    <CardHeader className="border-b pb-0!">
                      <CardTitle className="flex items-center gap-2.5 text-lg font-bold text-foreground">
                        <MapPin className="h-5 w-5 text-primary" />
                        Return Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ReturnAddress form={form} />
                    </CardContent>
                  </Card>
                )}

                <Card className="border-2 shadow-lg">
                  <CardHeader className="border-b pb-0!">
                    <CardTitle className="flex items-center gap-2.5 text-lg font-bold text-foreground">
                      <MapPin className="h-5 w-5 text-primary" />
                      Destination
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ShipmentAddress
                      form={form}
                      addressPrefix="destinationAddress"
                      title="Destination Address"
                    />
                  </CardContent>
                </Card>
              </div>

              <Card className="border-2 shadow-lg mt-4">
                <CardHeader className="border-b pb-0!">
                  <CardTitle className="flex items-center gap-2.5 text-lg font-bold text-foreground">
                    <Package className="h-5 w-5 text-primary" />
                    Packages
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ShipmentPackages form={form} />
                </CardContent>
              </Card>
            </div>

            <div className="sticky bottom-0 right-0 flex justify-end pt-3 pb-3 pr-4 bg-background/95 backdrop-blur-sm border-t z-10">
              <Button
                type="submit"
                disabled={isLoading}
                className="px-8 py-6 text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all"
                onClick={(e) => {
                  console.log("Button clicked, form errors:", form.formState.errors);
                  console.log("Form values:", form.getValues());
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Get Quote
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
