import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText } from "lucide-react";
import * as React from "react";
import { formatDate } from "../utils";
import {
  ShipmentCostBreakupAPIResponseType,
  ShipmentTransactionsAPIResponseType,
} from "@/types/shipment";

interface ShipmentCostBreakupProps {
  isLoadingCostBreakup?: boolean;
  costBreakupData: ShipmentCostBreakupAPIResponseType;
  costBreakupError?: string | boolean;

  isLoadingTransactions?: boolean;
  transactionsData: ShipmentTransactionsAPIResponseType;
  transactionsError?: string | boolean;
}

const ShipmentCostBreakup: React.FC<ShipmentCostBreakupProps> = ({
  isLoadingCostBreakup,
  costBreakupData,
  costBreakupError,
  isLoadingTransactions,
  transactionsData,
  transactionsError,
}: ShipmentCostBreakupProps) => {
  const [accordionValue, setAccordionValue] =
    React.useState<string>("cost-breakup");
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="flex size-5 items-center justify-center text-lg font-semibold">
            ₹
          </span>
          Finance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion
          type="single"
          collapsible
          value={accordionValue}
          onValueChange={setAccordionValue}
        >
          {/* Cost Breakup Accordion Item */}
          <AccordionItem value="cost-breakup">
            <AccordionTrigger className="cursor-pointer">
              <div className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center text-lg font-semibold">
                  ₹
                </span>
                <span>Cost Breakup</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {isLoadingCostBreakup ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : costBreakupError ? (
                <div className="text-destructive text-sm">
                  Error loading cost breakup: {costBreakupError}
                </div>
              ) : costBreakupData &&
                costBreakupData.cost_breakup[0]?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead> Charge Head</TableHead>
                      <TableHead className="text-right">
                        Amount (w/o tax)
                      </TableHead>
                      <TableHead className="text-right">CGST</TableHead>
                      <TableHead className="text-right">SGST</TableHead>
                      <TableHead className="text-right">IGST</TableHead>
                      <TableHead className="text-right">Total GST</TableHead>
                      <TableHead className="text-right">Total Amount</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {costBreakupData.cost_breakup[0].map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {item.charge_head}
                        </TableCell>
                        <TableCell className="text-right">
                          ₹
                          {item.total_without_tax
                            ? parseFloat(
                                item.total_without_tax.toString(),
                              ).toFixed(2)
                            : ""}
                        </TableCell>
                        <TableCell className="text-right">
                          ₹
                          {item?.cgst
                            ? parseFloat(item.cgst.toString()).toFixed(2)
                            : ""}
                        </TableCell>
                        <TableCell className="text-right">
                          ₹
                          {item?.sgst
                            ? parseFloat(item.sgst.toString()).toFixed(2)
                            : ""}
                        </TableCell>
                        <TableCell className="text-right">
                          ₹
                          {item?.igst
                            ? parseFloat(item.igst.toString()).toFixed(2)
                            : ""}
                        </TableCell>
                        <TableCell className="text-right">
                          ₹
                          {item?.total_gst
                            ? parseFloat(item.total_gst.toString()).toFixed(2)
                            : ""}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₹
                          {item?.total_amount
                            ? parseFloat(item.total_amount.toString()).toFixed(
                                2,
                              )
                            : ""}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {item.created_at ? formatDate(item.created_at) : ""}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-muted-foreground text-sm">
                  No cost breakup data available
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Transactions Accordion Item */}
          <AccordionItem value="transactions">
            <AccordionTrigger className="cursor-pointer">
              <div className="flex items-center gap-2">
                <FileText className="size-4" />
                <span>Transactions</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {isLoadingTransactions ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : transactionsError ? (
                <div className="text-destructive text-sm">
                  Error loading transactions: {transactionsError}
                </div>
              ) : transactionsData &&
                transactionsData.transaction?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Remark</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionsData.transaction.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {item.payment_type}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₹{parseFloat(item.transaction_amount).toFixed(2)}
                        </TableCell>
                        <TableCell>{item.remark}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDate(item.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-muted-foreground text-sm">
                  No transaction data available
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default ShipmentCostBreakup;
