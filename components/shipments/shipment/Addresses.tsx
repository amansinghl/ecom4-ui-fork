import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShipmentAddressesType } from "@/types/shipment";
import { Building, Home, MapPin, Phone } from "lucide-react";
import * as React from "react";

const ShipmentAddresses: React.FC<{
  addressesData: ShipmentAddressesType;
  isLoadingAddresses: boolean;
}> = ({ addressesData, isLoadingAddresses }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="size-5" />
          Addresses & Customer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoadingAddresses ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <Skeleton className="h-32" />
            </div>
            <div>
              <Skeleton className="h-32" />
            </div>
          </div>
        ) : addressesData ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Origin Address */}
            {addressesData.origin_address && (
              <div>
                <p className="flex items-center gap-2 font-semibold text-green-600">
                  <Home className="size-4" />
                  Origin
                </p>
                {addressesData.origin_address.full_name && (
                  <p className="mt-1 text-sm font-medium">
                    {addressesData.origin_address.full_name}
                  </p>
                )}
                {addressesData.origin_address.address_line_1 && (
                  <p className="text-muted-foreground mt-1 text-xs">
                    {addressesData.origin_address.address_line_1}
                  </p>
                )}
                {addressesData.origin_address.address_line_2 && (
                  <p className="text-muted-foreground text-xs">
                    {addressesData.origin_address.address_line_2}
                  </p>
                )}
                {addressesData.origin_address.city &&
                  addressesData.origin_address.state && (
                    <p className="text-muted-foreground mt-1 text-xs">
                      {addressesData.origin_address.city},{" "}
                      {addressesData.origin_address.state}
                    </p>
                  )}
                {addressesData.origin_address.pincode && (
                  <Badge variant="outline" className="mt-1 text-xs">
                    PIN: {addressesData.origin_address.pincode}
                  </Badge>
                )}
                {addressesData.origin_address.contact && (
                  <div className="text-muted-foreground mt-2 flex items-center gap-2 text-xs">
                    <Phone className="size-3" />
                    <span>
                      {addressesData.origin_address.calling_code || "+91"}{" "}
                      {addressesData.origin_address.contact}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Destination Address */}
            {addressesData.destination_address && (
              <div>
                <p className="flex items-center gap-2 font-semibold text-blue-600">
                  <Building className="size-4" />
                  Destination
                </p>
                {addressesData.destination_address.full_name && (
                  <p className="mt-1 text-sm font-medium">
                    {addressesData.destination_address.full_name}
                  </p>
                )}
                {addressesData.destination_address.address_line_1 && (
                  <p className="text-muted-foreground mt-1 text-xs">
                    {addressesData.destination_address.address_line_1}
                  </p>
                )}
                {addressesData.destination_address.address_line_2 && (
                  <p className="text-muted-foreground text-xs">
                    {addressesData.destination_address.address_line_2}
                  </p>
                )}
                {addressesData.destination_address.city &&
                  addressesData.destination_address.state && (
                    <p className="text-muted-foreground mt-1 text-xs">
                      {addressesData.destination_address.city},{" "}
                      {addressesData.destination_address.state}
                    </p>
                  )}
                {addressesData.destination_address.pincode && (
                  <Badge variant="outline" className="mt-1 text-xs">
                    PIN: {addressesData.destination_address.pincode}
                  </Badge>
                )}
                {addressesData.destination_address.contact && (
                  <div className="text-muted-foreground mt-2 flex items-center gap-2 text-xs">
                    <Phone className="size-3" />
                    <span>
                      {addressesData.destination_address.calling_code || "+91"}{" "}
                      {addressesData.destination_address.contact}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-muted-foreground text-sm">
            Address information not available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShipmentAddresses;
