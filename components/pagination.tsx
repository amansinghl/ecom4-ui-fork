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
import ShipmentsConfig from "@/configs/shipments";

type CustomPaginationType = {
  changePageSize: (pageSize: number) => void;
} & PaginationType;

const CustomPagination: React.FC<CustomPaginationType> = (
  props: CustomPaginationType,
) => {
  return (
    <div className="rounded-md border my-5">
      <div className="text-sm flex align-middle justify-end px-2 py-3">
        <div>
          <Pagination>
            <PaginationContent>
              <div>
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
                  {ShipmentsConfig.perPageShipmentsOption.map(
                    (perPageOption) => {
                      return (
                        <option key={perPageOption} value={perPageOption}>
                          {perPageOption}
                        </option>
                      );
                    },
                  )}
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
