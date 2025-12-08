import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ShipmentPackageDetailsAPIResponseType } from "@/types/shipment";
import { Package } from "lucide-react";
import * as React from "react";

const ShipmentPackageDetails: React.FC<{
  isLoadingPackageDetails: boolean;
  packageDetailsData: ShipmentPackageDetailsAPIResponseType;
}> = ({
  isLoadingPackageDetails,
  packageDetailsData,
}: {
  isLoadingPackageDetails: boolean;
  packageDetailsData: ShipmentPackageDetailsAPIResponseType;
}) => {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="size-5" />
            Package & Product
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingPackageDetails ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Skeleton className="h-16" />
              </div>
              <div>
                <Skeleton className="h-16" />
              </div>
              <div>
                <Skeleton className="h-16" />
              </div>
            </div>
          ) : packageDetailsData &&
            packageDetailsData?.package_details?.length > 0 ? (
            <>
              {packageDetailsData?.package_details?.map((pkg, index) => (
                <div key={index} className="space-y-4">
                  {packageDetailsData?.package_details?.length > 1 && (
                    <div className="text-muted-foreground text-sm font-semibold">
                      Package {index + 1}
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-muted-foreground text-xs">
                        Product Description
                      </p>
                      <p className="text-sm font-medium">
                        {pkg.product_description || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">
                        Package Count
                      </p>
                      <p className="text-sm font-medium">
                        {pkg.package_count ?? "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">
                        Product Value
                      </p>
                      <p className="text-sm font-medium">
                        {pkg.product_value
                          ? `₹${parseFloat(pkg.product_value).toFixed(2)}`
                          : "—"}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-muted-foreground text-xs">Weight</p>
                      <p className="text-sm font-medium">
                        {pkg.weight
                          ? `${pkg.weight} ${pkg.weight_unit || "KG"}`
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">
                        Entered Weight
                      </p>
                      <p className="text-sm font-medium">
                        {pkg.entered_weight
                          ? `${pkg.entered_weight} ${pkg.weight_unit || "KG"}`
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">
                        Volumetric Weight
                      </p>
                      <p className="text-sm font-medium">
                        {pkg.volumetric_weight
                          ? `${pkg.volumetric_weight} ${pkg.weight_unit || "KG"}`
                          : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-muted-foreground text-xs">
                        Booked Weight
                      </p>
                      <p className="text-sm font-medium">
                        {pkg.booked_weight
                          ? `${pkg.booked_weight} ${pkg.weight_unit || "KG"}`
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">
                        Dimensions
                      </p>
                      <p className="text-sm font-medium">
                        {pkg.length && pkg.width && pkg.height
                          ? `${pkg.length} × ${pkg.width} × ${pkg.height} ${pkg.dimensions_unit || "cm"}`
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Picked Up</p>
                      <p className="text-sm font-medium">
                        {pkg.picked_up ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                  {index < packageDetailsData?.package_details?.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
            </>
          ) : (
            <div className="text-muted-foreground text-sm">
              Package information not available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShipmentPackageDetails;
