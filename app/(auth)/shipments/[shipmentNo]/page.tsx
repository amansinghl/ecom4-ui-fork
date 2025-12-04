"use client";

import { useParams } from "next/navigation";
import { useCompleteShipmentDetails } from "@/hooks/use-shipment-details";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";

export default function BlogPostPage() {
  const params = useParams();
  const { shipmentNo } = params;
  const shipmentDetails = useCompleteShipmentDetails(shipmentNo.toString());
  return (
    <div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Shipment Details</CardTitle>
          </CardHeader>
          <CardContent>{JSON.stringify(shipmentDetails)}</CardContent>
        </Card>
      </div>
    </div>
  );
}
