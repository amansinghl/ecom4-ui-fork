"use client";

import { toast } from "sonner";

export function copyToClipBoard(
  textToCopy: string,
  fieldName: string | null = null,
) {
  navigator.clipboard
    .writeText(textToCopy)
    .then(() => {
      const message = fieldName
        ? fieldName + " copied to clipboard"
        : "Copied to clipboard";
      toast.success(message);
    })
    .catch(() => {
      toast.error("Failed to copy!");
    });
}
