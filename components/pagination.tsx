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
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  TriangleAlertIcon,
} from "lucide-react";
import ShipmentsConfig from "@/configs/shipments";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { redirect, RedirectType } from "next/navigation";

const getPageList = (startPage: number = 1, lastPage: number = 1) => {
  const components = [];
  for (let i = startPage; i <= lastPage; i++) {
    components.push(
      <option key={i} value={i}>
        {i}
      </option>,
    );
  }
  return components;
};

type CustomPaginationType = {
  endpoint: string;
} & PaginationType;

const CustomPagination: React.FC<CustomPaginationType> = (
  props: CustomPaginationType,
) => {
  const changePageSize = (pageSize = 25) => {
    if (pageSize !== props.per_page) {
      let currentParams = window.location.search;
      if (currentParams.includes("per_page=")) {
        currentParams = currentParams.replace(
          "per_page=" + props.per_page,
          "per_page=" + pageSize,
        );
      } else {
        const queryAppend = currentParams.includes("?") ? "&" : "?";
        currentParams += queryAppend + "per_page=" + pageSize;
      }
      redirect(props?.endpoint + currentParams, RedirectType.push);
    }
  };
  const jumpToPage = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= props?.last_page) {
      let currentParams = window.location.search;
      if (currentParams.includes("page=")) {
        currentParams = currentParams.replace(
          "page=" + props.current_page,
          "page=" + pageNumber,
        );
      } else {
        const queryAppend = currentParams.includes("?") ? "&" : "?";
        currentParams += queryAppend + "page=" + pageNumber;
      }
      redirect(props?.endpoint + currentParams, RedirectType.push);
    }
  };
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
                <span>Jump to page:</span>
                <select
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    jumpToPage(Number(e.target.value));
                  }}
                  value={props?.current_page}
                  className="border rounded-md px-1.5 py-1"
                >
                  {props?.current_page > props?.last_page && (
                    <option value={props?.current_page}>
                      {props?.current_page}
                    </option>
                  )}
                  {getPageList(1, props?.last_page)}
                </select>
                {props?.current_page > props?.last_page && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TriangleAlertIcon
                        size={19}
                        color="oklch(63.7% 0.237 25.331)"
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The Current Page value is invalid</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              <div className="flex justify-center items-center gap-2.5 ml-2">
                <span>Rows per page:</span>
                <select
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    changePageSize(Number(e.target.value));
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
