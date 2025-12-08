"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Ban,
  FileText,
  Package,
  Printer,
  RefreshCw,
  Share2,
  Shuffle,
  WeightIcon,
} from "lucide-react";
import * as React from "react";
import {
  getPaymentTypeBadgeClasses,
  getSolutionIcon,
  getStatusBadgeVariant,
  getStatusIcon,
} from "../utils";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ShipmentDetailsType } from "@/types/shipment";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ShipmentDetailsInterface {
  shipmentData: ShipmentDetailsType;
  share: () => void;
}

const ShipmentDetails: React.FC<ShipmentDetailsInterface> = ({
  shipmentData,
  share,
}) => {
  const [isCancelOpen, setIsCancelOpen] = React.useState(false);
  return (
    <Card className="my-3">
      <CardContent>
        {shipmentData ? (
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                {getStatusIcon(shipmentData.tracking_category ?? "Unknown")}
                <Badge
                  variant={getStatusBadgeVariant(
                    shipmentData.tracking_category ?? "Unknown",
                  )}
                  className="text-xs"
                >
                  {shipmentData.tracking_category ?? "Unknown"}
                </Badge>
              </div>
              <h1 className="mt-2 flex items-center gap-3 text-3xl font-bold tracking-tight">
                <Package className="text-primary size-8" />
                {shipmentData.shipment_no}
              </h1>
              <p className="text-muted-foreground mt-1">
                Shipment details and tracking information
              </p>

              {/* Shipment Details */}
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                {(shipmentData.awb_no || shipmentData.tracking_id) && (
                  <Badge variant="outline" className="text-xs">
                    <span className="font-mono">
                      AWB: {shipmentData.awb_no || shipmentData.tracking_id}
                    </span>
                  </Badge>
                )}
                {shipmentData.partner_name && (
                  <Badge variant="outline" className="text-xs">
                    Partner: {shipmentData.partner_name}
                  </Badge>
                )}
                {shipmentData.solution && (
                  <Badge variant="outline" className="text-xs">
                    {getSolutionIcon(shipmentData.solution)}
                    {shipmentData.solution}
                  </Badge>
                )}
                {shipmentData.invoice_weight && (
                  <Badge variant="secondary" className="text-xs">
                    <WeightIcon className="mr-1 size-3" />
                    {shipmentData?.invoice_weight}
                  </Badge>
                )}
                {shipmentData.shipment_cost && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className="border-green-500/50 bg-green-500/10 text-xs text-green-700 dark:text-green-400"
                      >
                        Cost: ₹
                        {parseFloat(shipmentData.shipment_cost).toFixed(2)}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Shipment cost: ₹
                        {parseFloat(shipmentData.shipment_cost).toFixed(2)}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {shipmentData.payment_type && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getPaymentTypeBadgeClasses(shipmentData.payment_type)}`}
                      >
                        {shipmentData.payment_type}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Payment type: {shipmentData.payment_type}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {shipmentData.booking_channel && (
                  <Badge variant="outline" className="text-xs">
                    Channel: {shipmentData.booking_channel}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ButtonGroup>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Printer className="mr-2 size-4" />
                      Print
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem disabled>
                      <FileText /> Label (Coming soon)
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                      <FileText /> Manifest (Coming soon)
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                      <FileText /> Invoice Label (Coming soon)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                      Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        setIsCancelOpen(true);
                      }}
                    >
                      <Ban /> Cancel
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => alert("Rebook")}>
                      <RefreshCw /> Rebook
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => alert("Change Partner")}>
                      <Shuffle /> Change Partner
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button size="sm" variant="outline" onClick={share}>
                  <Share2 className="mr-2 size-4" />
                  Share
                </Button>
              </ButtonGroup>
            </div>

            {/* Cancel Confirmation Dialog */}
            <AlertDialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel this shipment?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You are about to cancel shipment {shipmentData?.shipment_no}
                    . This action may be irreversible and could incur charges
                    with the logistics partner.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Shipment</AlertDialogCancel>
                  <AlertDialogAction onClick={() => alert("Cancel")}>
                    Confirm Cancel
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : (
          <Skeleton />
        )}
      </CardContent>
    </Card>
  );
};

export default ShipmentDetails;
