"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

export default function PrintablesPage() {
  return (
    <div className="space-y-6">
      {/* Heading Section */}
      <div>
        <h1 className="text-2xl font-semibold">Printables</h1>
        <p className="text-muted-foreground text-sm">
          Customize and manage your shipping labels and printable documents
        </p>
      </div>

      {/* Label Customization Card */}
      <Card className="max-w-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Shipping Labels</CardTitle>
          <CardDescription className="text-xs">
            Customize your shipping labels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Sample Label Image */}
          <div className="relative aspect-[2/2] w-full overflow-hidden rounded border bg-muted">
            <div className="flex h-full items-center justify-center">
              <div className="text-center space-y-1 p-2">
                <div className="mx-auto h-12 w-12 rounded border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-muted-foreground/50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-muted-foreground text-[10px]">Preview</p>
              </div>
            </div>
          </div>

          {/* Customize Button */}
          <Link href="/personalize/printables/customize-labels">
            <Button className="w-full" size="sm">Customize Labels</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
