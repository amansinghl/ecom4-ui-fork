"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { getShipmentStatusDetails } from "./shipment-statuses";
import { Box, CreditCard, Weight, Copy } from "lucide-react";
import { copyToClipBoard } from "@/lib/client_utils";

const ShipmentsRow: React.FC<React.ComponentProps<"tr">> = ({
  className,
  ...props
}: React.ComponentProps<"tr">) => {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className,
      )}
      {...props}
    >
      <td className="p-5 w-72">
        <div className="font-bold">{props?.data?.original?.shipment_no}</div>
        <div className="text-xs">AWB: {props?.data?.original?.tracking_id}</div>
        <div className="text-xs">Ref: {props?.data?.original?.reference1}</div>
      </td>
      <td className="p-5 w-64">
        <div className="font-bold">{props?.data?.original?.seller_name}</div>
        <div className="text-xs">
          <b>Contact:</b>
          <div className="flex gap-1 items-center">
            {props?.data?.original?.seller_contact}{" "}
            <Copy
              onClick={() =>
                copyToClipBoard(props?.data?.original?.seller_contact)
              }
              className="cursor-pointer"
              size={11}
            />
          </div>
        </div>
        <div className="text-xs">
          <b>Pincode:</b>
          {props?.data?.original?.from_pincode}
        </div>
        <div className="text-xs">
          <b>Location:</b> {props?.data?.original?.origin_city},{" "}
          {props?.data?.original?.origin_state}
        </div>
      </td>
      <td className="p-5 w-64">
        <div className="font-bold">{props?.data?.original?.consignee_name}</div>
        <div className="text-xs">
          <b>Contact:</b>
          <div className="flex gap-1 items-center">
            {props?.data?.original?.consignee_contact}{" "}
            <Copy
              onClick={() =>
                copyToClipBoard(props?.data?.original?.consignee_contact)
              }
              className="cursor-pointer"
              size={11}
            />
          </div>
        </div>
        <div className="text-xs">
          <b>Pincode:</b>
          {props?.data?.original?.to_pincode}
        </div>
        <div className="text-xs">
          <b>Location:</b> {props?.data?.original?.destination_city},{" "}
          {props?.data?.original?.destination_state}
        </div>
      </td>
      <td className="p-5 w-56 text-center">
        <div>{props?.data?.original?.from_pincode}</div>
        <div className="mx-1">to</div>
        <div>{props?.data?.original?.to_pincode}</div>
      </td>
      <td className="p-5 w-56">
        <div>
          {
            getShipmentStatusDetails(props?.data?.original?.tracking_status)
              ?.message
          }
        </div>
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-300">
          status code: {props?.data?.original?.tracking_status}
        </div>
      </td>
      <td className="p-5 w-56">{props?.data?.original?.shipment_date}</td>
      <td className="p-5 w-56">
        <div className="flex gap-1 align-middle justify-center items-center">
          {props?.data?.original?.cod_value > 0 ? (
            <Box color="purple" size={16} />
          ) : (
            <CreditCard color="green" size={16} />
          )}
          {props?.data?.original?.cod_value > 0 ? "COD" : "Prepaid"}
        </div>
      </td>
      <td className="p-5 w-56">{props?.data?.original?.product}</td>
      <td className="p-5 w-56">
        <div className="flex gap-1 align-middle justify-center items-center">
          <Weight size={16} />
          {props?.data?.original?.weight} Kg
        </div>
      </td>
    </tr>
  );
};

export default ShipmentsRow;
