"use client"

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { Truck, CheckCircle, PackageSearch, Clock } from "lucide-react"
import { useDashboardOverview } from "@/hooks/use-dashboard"
import { useMemo } from "react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SectionCards() {
  const { data: overviewData, isLoading } = useDashboardOverview()

  const stats = useMemo(() => {
    if (!overviewData?.shipment) {
      return {
        totalShipments: 0,
        deliveredRate: 0,
        inTransit: 0,
        pendingPickup: 0,
        trendPercentage: 0,
        deliveredShipments: 0,
      }
    }

    const shipment = overviewData.shipment
    const totalShipments = shipment.total_shipments || 0
    const deliveredShipments = shipment.delivered_shipments || 0
    const inTransit = shipment.in_transit_shipments || 0
    const pendingPickup = shipment.unpicked_shipments || 0
    const trendPercentage = shipment.trend_percentage || 0

    // Calculate delivery rate
    const deliveryRate =
      totalShipments > 0
        ? ((deliveredShipments / totalShipments) * 100).toFixed(1)
        : "0"

    return {
      totalShipments,
      deliveredRate: parseFloat(deliveryRate),
      inTransit,
      pendingPickup,
      trendPercentage,
      deliveredShipments,
    }
  }, [overviewData])

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Total Shipments
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoading ? "..." : stats.totalShipments.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {stats.trendPercentage >= 0 ? (
                <IconTrendingUp className="h-3 w-3" />
              ) : (
                <IconTrendingDown className="h-3 w-3" />
              )}
              {stats.trendPercentage >= 0 ? "+" : ""}
              {stats.trendPercentage}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.trendPercentage >= 0 ? (
              <>
                Trending up this month <IconTrendingUp className="size-4" />
              </>
            ) : (
              <>
                Down this period <IconTrendingDown className="size-4" />
              </>
            )}
          </div>
          <div className="text-muted-foreground">
            Shipments in the last 30 days
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Delivered Rate
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoading ? "..." : `${stats.deliveredRate}%`}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <CheckCircle className="h-3 w-3" />
              {stats.deliveredShipments}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Delivery success rate <CheckCircle className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {stats.deliveredShipments} of {stats.totalShipments} delivered
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            In Transit
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoading ? "..." : stats.inTransit.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <Clock className="h-3 w-3" />
              Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Currently in transit <Clock className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Shipments being delivered
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <PackageSearch className="h-4 w-4" />
            Pending Pickup
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoading ? "..." : stats.pendingPickup.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <PackageSearch className="h-3 w-3" />
              Waiting
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Awaiting pickup <PackageSearch className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Shipments ready for pickup
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
