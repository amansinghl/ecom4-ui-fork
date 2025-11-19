import * as React from "react";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PaginationType } from "@/types/shipments";

import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

type CustomPaginationType = {
  changePageSize: (pageSize: number) => void;
} & PaginationType;

const CustomPagination: React.FC<CustomPaginationType> = (
  props: CustomPaginationType,
) => {
  if (props?.last_page <= 1) {
    return <></>;
  }
  return (
    <div className="rounded-md border my-5">
      <div className="flex align-middle justify-between px-2 py-3">
        <div>Jump to Page</div>
        <div>
          <Pagination>
            <PaginationContent>
              <div className="text-sm">
                Page {props?.current_page} of {props?.last_page}
              </div>
              <div className="flex justify-center items-center gap-2.5 ml-2">
                <span>Rows per page:</span>
                <select
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    props.changePageSize(Number(e.target.value));
                  }}
                  value={props?.per_page}
                  className="border rounded-md px-1.5 py-1"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={500}>500</option>
                </select>
              </div>
              <PaginationItem>
                {props?.prev_page_url ? (
                  <PaginationPrevious
                    className="cursor-pointer"
                    href={props?.prev_page_url}
                  />
                ) : (
                  <Button
                    className="cursor-not-allowed"
                    size="sm"
                    variant="link"
                    disabled
                  >
                    <ChevronLeftIcon />{" "}
                    <span className="hidden sm:block">Previous</span>
                  </Button>
                )}
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">{props?.current_page}</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                {props?.next_page_url ? (
                  <PaginationNext href={props?.next_page_url ?? "#"} />
                ) : (
                  <Button
                    className="cursor-not-allowed"
                    size="sm"
                    variant="link"
                    disabled
                  >
                    <span className="hidden sm:block">Next</span>
                    <ChevronRightIcon />
                  </Button>
                )}
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
};

export default CustomPagination;
