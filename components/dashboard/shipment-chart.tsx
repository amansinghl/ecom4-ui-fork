"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { useMemo } from "react"
import { useWeeklyShipmentMetrics } from "@/hooks/use-dashboard"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { Skeleton } from "@/components/ui/skeleton"

export const description = "An interactive shipment chart"

const chartConfig = {
  shipments: {
    label: "Shipments",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

export function ShipmentChart() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("12w")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("4w")
    }
  }, [isMobile])

  // Calculate date range based on time range selection
  const dateRange = useMemo(() => {
    const today = new Date()
    const toDate = today.toISOString().split("T")[0]
    
    let weeksToSubtract = 12
    if (timeRange === "8w") {
      weeksToSubtract = 8
    } else if (timeRange === "4w") {
      weeksToSubtract = 4
    }
    
    const fromDate = new Date(today)
    fromDate.setDate(fromDate.getDate() - weeksToSubtract * 7)
    const fromDateStr = fromDate.toISOString().split("T")[0]
    
    return { fromDate: fromDateStr, toDate }
  }, [timeRange])

  const { data: metricsData, isLoading } = useWeeklyShipmentMetrics({
    from_date: dateRange.fromDate,
    to_date: dateRange.toDate,
  })

  // Transform API data to chart format
  const chartData = useMemo(() => {
    if (!metricsData?.metrics) return []
    
    return metricsData.metrics
      .map((item) => ({
        date: item.week_start_date,
        shipments: item.shipment_count,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [metricsData])

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Shipment Volume</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total shipments per week
          </span>
          <span className="@[540px]/card:hidden">Weekly shipments</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="12w">Last 12 weeks</ToggleGroupItem>
            <ToggleGroupItem value="8w">Last 8 weeks</ToggleGroupItem>
            <ToggleGroupItem value="4w">Last 4 weeks</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 12 weeks" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="12w" className="rounded-lg">
                Last 12 weeks
              </SelectItem>
              <SelectItem value="8w" className="rounded-lg">
                Last 8 weeks
              </SelectItem>
              <SelectItem value="4w" className="rounded-lg">
                Last 4 weeks
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <Skeleton className="h-[250px] w-full" />
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[250px]">
            <div className="text-muted-foreground">No shipment data available</div>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillShipments" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--chart-2)"
                    stopOpacity={1.0}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--chart-2)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <ChartTooltip
                cursor={false}
                defaultIndex={isMobile ? -1 : Math.floor(chartData.length / 2)}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      const date = new Date(value)
                      const endDate = new Date(date)
                      endDate.setDate(endDate.getDate() + 6)
                      return `${date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })} - ${endDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}`
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="shipments"
                type="natural"
                fill="url(#fillShipments)"
                stroke="var(--chart-5)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
