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

const CustomPagination: React.FC<PaginationType> = (props: PaginationType) => {
  if (props?.last_page <= 1) {
    return <></>;
  }
  return (
    <div className="flex align-middle justify-between px-2 py-3">
      <div>Jump to Page</div>
      <div>
        <Pagination>
          <PaginationContent>
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
  );
};

export default CustomPagination;
