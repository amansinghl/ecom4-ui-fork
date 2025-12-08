import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Info,
  MapPin,
} from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { ShipmentTrackingAPIResponseType } from "@/types/shipment";

const getStatusIcon = (statusMessage?: string | null) => {
  if (!statusMessage) return <Info className="size-4 text-blue-600" />;
  const lower = statusMessage.toLowerCase();
  if (lower.includes("delivered") || lower.includes("success")) {
    return <CheckCircle2 className="size-4 text-green-600" />;
  }
  if (
    lower.includes("cancelled") ||
    lower.includes("error") ||
    lower.includes("failed")
  ) {
    return <AlertTriangle className="size-4 text-red-600" />;
  }
  if (lower.includes("warning") || lower.includes("pending")) {
    return <AlertTriangle className="size-4 text-amber-600" />;
  }
  return <Info className="size-4 text-blue-600" />;
};

const ShipmentTrackingTimeline: React.FC<ShipmentTrackingAPIResponseType> = ({
  partner_tracking_url,
  tracking_details,
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="size-5" />
            Tracking Timeline
          </CardTitle>
          {partner_tracking_url && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                window.open(
                  partner_tracking_url,
                  "_blank",
                  "noopener,noreferrer",
                )
              }
            >
              <ExternalLink className="mr-1 size-3" />
              Track on Partner
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[60vh] overflow-y-auto pr-2">
          <div className="relative">
            <div className="bg-border absolute top-0 bottom-0 left-3 w-px" />
            <ul className="space-y-5">
              {!tracking_details || tracking_details?.length === 0 ? (
                <li className="text-muted-foreground pl-8 text-sm">
                  No tracking events available
                </li>
              ) : (
                tracking_details.map((event, idx) => (
                  <li key={event.id || idx} className="relative pl-8">
                    <div className="bg-background absolute top-0 left-0 grid size-6 place-items-center rounded-full border">
                      {getStatusIcon(event.status_message)}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="font-medium">
                        {event.status_message || "Unknown Status"}
                      </div>
                      {event.event_date && (
                        <Badge variant="outline" className="text-xs">
                          {new Date(event.event_date).toLocaleString("en-IN", {
                            hour12: false,
                          })}
                        </Badge>
                      )}
                    </div>
                    {event.comment && (
                      <p className="text-muted-foreground mt-1 text-sm">
                        {event.comment}
                      </p>
                    )}
                    {event.location && (
                      <div className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                        <MapPin className="size-3" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShipmentTrackingTimeline;
