"use client";

import { toast } from "sonner";

export function copyToClipBoard(
  textToCopy: string,
  fieldName: string = "Text",
) {
  navigator.clipboard
    .writeText(textToCopy)
    .then(() => {
      toast(fieldName + " copied to clipboard");
    })
    .catch((err) => console.error("Failed to copy: ", err));
}
