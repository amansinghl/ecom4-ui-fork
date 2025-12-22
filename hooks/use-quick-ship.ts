"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { quickShipFormSchema, QuickShipFormData } from "@/lib/quick-ship-schema";
import { getQuote } from "@/api/orders";
import { toast } from "sonner";
import { transformQuickShipToQuoteRequest } from "@/transformers/quote-request";

export function useQuickShip(defaultBranchId: string) {
  const form = useForm<QuickShipFormData>({
    resolver: zodResolver(quickShipFormSchema),
    defaultValues: {
      shipmentType: "forward",
      transportMode: "express",
      businessType: undefined,
      paymentType: "prepaid",
      originAddress: {
        locationType: "saved",
        full_name: "",
        email: "",
        calling_code: "91",
        contact: "",
        address_line_1: "",
        address_line_2: "",
        pincode: "",
        city: "",
        state: "",
        country: "India",
      },
      destinationAddress: {
        locationType: "saved",
        full_name: "",
        email: "",
        calling_code: "91",
        contact: "",
        address_line_1: "",
        address_line_2: "",
        pincode: "",
        city: "",
        state: "",
        country: "India",
      },
      useDifferentReturnAddress: false,
      returnAddress: undefined,
      branch_id: defaultBranchId || "",
      reference1: "",
      reference2: "",
      cod_value: undefined,
      products: [
        {
          product_name: "",
          product_weight: undefined,
          product_value: undefined,
          quantity: 1,
        },
      ],
      package: {
        package_description: "",
        length: 1,
        breadth: 1,
        height: 1,
        dimensions_unit: "inch",
        quantity: 1,
      },
    },
    mode: "onChange",
  });

  const mutation = useMutation({
    mutationFn: (data: QuickShipFormData) => {
      const requestData = transformQuickShipToQuoteRequest(data);
      return getQuote(requestData);
    },
    onSuccess: () => {
      // toast.success("Quote generated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to generate quote");
    },
  });

  const onSubmit = form.handleSubmit(
    (data: QuickShipFormData) => {
      const requestData = transformQuickShipToQuoteRequest(data);
      mutation.mutate(data);
    },
    (errors) => {
      toast.error("Please fix the form errors before submitting");
    }
  );

  return {
    form,
    onSubmit,
    isLoading: mutation.isPending,
    error: mutation.error,
    quoteData: mutation.data,
    isQuoteSuccess: mutation.isSuccess,
    resetQuote: () => mutation.reset(),
  };
}

