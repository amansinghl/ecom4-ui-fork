"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type CodTransactionsOverallResponse } from "@/types/cod-transactions";

type CodSnapshotCardsProps = {
  data: CodTransactionsOverallResponse | undefined;
  isLoading?: boolean;
};

const formatCurrency = (amount: string | null | undefined) => {
  if (!amount) return "₹0.00";
  const numAmount = parseFloat(amount);
  return `₹${numAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export function CodSnapshotCards({ data, isLoading }: CodSnapshotCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <CardTitle className="h-4 w-full bg-muted rounded"></CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="h-5 w-40 bg-muted rounded"></div>
                <div className="h-4 w-32 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const cards = [
    {
      title: "Booked Shipments in last 90 days",
      shipments: data.total_shipments?.total_shipments ?? 0,
      amount: data.total_shipments?.total_cod ?? "0.00",
    },
    {
      title: "Undelivered Shipments in last 90 days",
      shipments: data.cod_pickup_shipment?.total_shipments ?? 0,
      amount: data.cod_pickup_shipment?.total_cod ?? "0.00",
    },
    {
      title: "Cod Remittance Pending in last 90 days",
      shipments: data.pending?.total_shipments ?? 0,
      amount: data.pending?.total_cod ?? "0.00",
    },
    {
      title: "COD amount initiated to your bank account",
      shipments: data.initiated?.total_shipments ?? 0,
      amount: data.initiated?.total_cod ?? "0.00",
    },
    {
      title: "Cod Remitted in last 90 days",
      shipments: data.cod_remitted?.total_shipments ?? 0,
      amount: data.cod_remitted?.total_cod ?? "0.00",
    },
    {
      title: "Ineligible Cod in last 90 days",
      shipments: data.cod_not_eligible?.total_shipments ?? 0,
      amount: data.cod_not_eligible?.total_cod ?? "0.00",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => (
        <Card 
          key={index} 
          className="hover:shadow-md transition-all duration-200 border-border/50 hover:border-border"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium leading-tight text-primary">
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2.5">
              <div className="text-base font-semibold text-foreground">
                Total shipments: <span className="text-primary">{card.shipments}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Total Amount: <span className="font-medium text-foreground">{formatCurrency(card.amount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

