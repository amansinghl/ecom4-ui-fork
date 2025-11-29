import * as React from "react";

import { Skeleton } from "@/components/ui/skeleton";

type DataTableSkeletonProps = {
  columns: number;
  rows?: number;
  withToolbar?: boolean;
};

export function DataTableSkeleton({ columns, rows = 8, withToolbar = true }: DataTableSkeletonProps) {
  return (
    <div className="space-y-4">
      {withToolbar ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-36" />
            <Skeleton className="h-9 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
      ) : null}

      <div className="rounded-md border">
        <div
          className="bg-muted/50 grid grid-cols-[repeat(var(--cols),minmax(0,1fr))] border-b p-3"
          style={{
            // @ts-ignore CSS var for Tailwind grid template
            "--cols": String(columns),
          }}
        >
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-24" />
          ))}
        </div>
        <div className="divide-y">
          {Array.from({ length: rows }).map((_, r) => (
            <div
              key={r}
              className="grid grid-cols-[repeat(var(--cols),minmax(0,1fr))] p-3"
              style={{
                // @ts-ignore CSS var for Tailwind grid template
                "--cols": String(columns),
              }}
            >
              {Array.from({ length: columns }).map((__, c) => (
                <Skeleton key={c} className="h-4 w-[80%]" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
