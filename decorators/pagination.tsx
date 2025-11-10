import { PaginationType } from "@/types/shipments";

export const decoratePagination = (
  pagination: PaginationType,
  pathname: string,
): PaginationType => {
  return {
    first_page_url:
      pagination?.current_page === 1 ? null : pathname + "?page=1",
    prev_page_url:
      pagination?.current_page === 1
        ? null
        : pathname + "?page=" + (pagination?.current_page - 1),
    next_page_url:
      pagination?.current_page === pagination?.last_page
        ? null
        : pathname + "?page=" + (pagination?.current_page + 1),
    last_page_url:
      pagination?.current_page === pagination?.last_page
        ? null
        : pathname + "?page=" + pagination?.last_page,

    current_page: pagination?.current_page,
    from: pagination?.from,
    to: pagination?.to,
    last_page: pagination?.last_page,

    per_page: pagination?.per_page,
    total: pagination?.total,
  };
};
