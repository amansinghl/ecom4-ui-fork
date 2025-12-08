"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShipmentAddressesType } from "@/types/shipment";
import { MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import * as React from "react";
import {
  buildAddressString,
  geocodeAddress,
  getAddressComponents,
} from "@/lib/geo";

interface ShipmentRouteMapProps {
  addressesData?: ShipmentAddressesType;
}

const Map = dynamic(
  () => import("@/components/ui/map").then((mod) => ({ default: mod.Map })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[400px] w-full" />,
  },
);

const ShipmentRouteMap: React.FC<ShipmentRouteMapProps> = ({
  addressesData,
}) => {
  const [isGeocoding, setIsGeocoding] = React.useState(false);
  const [geocodingError, setGeocodingError] = React.useState<string | null>(
    null,
  );
  const [originCoords, setOriginCoords] = React.useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [destinationCoords, setDestinationCoords] = React.useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const geocodeAddresses = async () => {
    try {
      const originAddr = addressesData?.origin_address;
      const destAddr = addressesData?.destination_address;
      if (!originAddr || !destAddr) {
        setGeocodingError("Invalid Address format for Geo-Coding");
        return false;
      }

      setIsGeocoding(true);
      setGeocodingError(null);

      const originAddress = buildAddressString(originAddr);
      const destinationAddress = buildAddressString(destAddr);
      const originComponents = getAddressComponents(originAddr);
      const destinationComponents = getAddressComponents(destAddr);

      // Geocode sequentially to avoid rate limiting and allow fallback strategies
      const originResult = await geocodeAddress(
        originAddress,
        originComponents,
      );

      // Small delay between requests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const destinationResult = await geocodeAddress(
        destinationAddress,
        destinationComponents,
      );

      if (originResult) {
        setOriginCoords(originResult);
      }
      if (destinationResult) {
        setDestinationCoords(destinationResult);
      }

      if (!originResult || !destinationResult) {
        const missing = [];
        if (!originResult) missing.push("origin");
        if (!destinationResult) missing.push("destination");
        setGeocodingError(
          `Unable to geocode ${missing.join(" and ")} address${missing.length > 1 ? "es" : ""}. Please check if pincode, city, and state are available.`,
        );
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setGeocodingError("Failed to geocode addresses. Please try again later.");
    } finally {
      setIsGeocoding(false);
    }
  };

  React.useEffect(() => {
    geocodeAddresses();
  }, [addressesData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="size-5" />
          Route Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isGeocoding ? (
          <div className="space-y-2">
            <Skeleton className="h-[400px] w-full" />
            <p className="text-muted-foreground text-center text-xs">
              Geocoding addresses...
            </p>
          </div>
        ) : geocodingError || !originCoords || !destinationCoords ? (
          <div className="text-muted-foreground flex h-[400px] items-center justify-center text-sm">
            {geocodingError ||
              "Unable to display map. Address coordinates not available."}
          </div>
        ) : (
          <Map
            origin={{
              lat: originCoords.lat,
              lng: originCoords.lng,
              name: addressesData.origin_address.full_name || "Origin",
              address: buildAddressString(addressesData.origin_address),
            }}
            destination={{
              lat: destinationCoords.lat,
              lng: destinationCoords.lng,
              name:
                addressesData.destination_address.full_name || "Destination",
              address: buildAddressString(addressesData.destination_address),
            }}
            height="400px"
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ShipmentRouteMap;
