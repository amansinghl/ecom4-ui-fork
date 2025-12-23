"use client";

import { Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCompleteShipmentDetails } from "@/hooks/use-shipment-details";
import ShipmentDetails from "@/components/shipments/shipment/Details";
import ShipmentAddresses from "@/components/shipments/shipment/Addresses";
import ShipmentPackageDetails from "@/components/shipments/shipment/PackageDetails";
import ShipmentCostBreakup from "@/components/shipments/shipment/CostBreakup";
import ShipmentRouteMap from "@/components/shipments/shipment/RouteMap";
import ShipmentTrackingTimeline from "@/components/shipments/shipment/TrackingTimeline";
import { Button } from "@/components/ui/button";
import { copyToClipBoard } from "@/lib/client_utils";

function BlogPostPageContent() {
  const params = useParams();
  const router = useRouter();
  const queryParams = useSearchParams();

  const { shipmentNo = "default" } = params;
  const shouldShowBackToShipments = queryParams.get("share") ? false : true;
  const shipmentDetails = useCompleteShipmentDetails(shipmentNo.toString());

  const share = () => {
    copyToClipBoard(`${window?.location?.href}?share=true`);
  };
  return (
    <div>
      {shouldShowBackToShipments && (
        <Button onClick={() => router.back()}>Go Back to Shipments</Button>
      )}
      <ShipmentDetails
        shipmentData={shipmentDetails?.shipment_details?.data?.details}
        share={share}
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
        <div className="space-y-3 lg:col-span-7">
          <ShipmentAddresses
            addressesData={shipmentDetails?.shipment_addresses?.data?.address}
            isLoadingAddresses={shipmentDetails?.shipment_addresses?.isLoading}
          />
          <ShipmentPackageDetails
            packageDetailsData={shipmentDetails?.shipment_packages?.data}
            isLoadingPackageDetails={
              shipmentDetails?.shipment_packages?.isLoading
            }
          />
          <ShipmentCostBreakup
            isLoadingCostBreakup={
              shipmentDetails?.shipment_cost_breakup_details?.isLoading
            }
            costBreakupData={
              shipmentDetails?.shipment_cost_breakup_details?.data
            }
            costBreakupError={
              shipmentDetails?.shipment_cost_breakup_details?.isError
                ? "Failed to Load Cost Breakup Details."
                : false
            }
            isLoadingTransactions={
              shipmentDetails?.shipment_transactions_details?.isLoading
            }
            transactionsData={
              shipmentDetails?.shipment_transactions_details?.data
            }
            transactionsError={
              shipmentDetails?.shipment_transactions_details?.isError
                ? "Failed to Load Transactions Details."
                : false
            }
          />
          <ShipmentRouteMap
            addressesData={shipmentDetails?.shipment_addresses?.data?.address}
          />
        </div>
        <div className="space-y-3 lg:col-span-3">
          <ShipmentTrackingTimeline
            {...shipmentDetails?.shipment_tracking_details?.data}
          />
        </div>
      </div>
    </div>
  );
}

export default function BlogPostPage() {
  return (
    <Suspense fallback={<h1>Loading...</h1>}>
      <BlogPostPageContent />
    </Suspense>
  );
}
